
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

interface FrameAnalysis {
    timestamp: string;
    hazards: string[];
    injuries: string[];
    environmentAssessment: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    rawAnalysis: string;
}

class VisionAnalysisService {
    private client: Anthropic | null = null;
    private imageStoragePath: string;

    constructor() {
        // Create directory to store images (this is safe to do immediately)
        this.imageStoragePath = path.join(process.cwd(), 'stored_frames');
        if (!fs.existsSync(this.imageStoragePath)) {
            fs.mkdirSync(this.imageStoragePath, { recursive: true });
        }
    }

    private getClient(): Anthropic {
        if (!this.client) {
            const apiKey = process.env.ANTHROPIC_API_KEY;

            if (!apiKey) {
                throw new Error('Missing ANTHROPIC_API_KEY in .env file');
            }

            this.client = new Anthropic({
                apiKey: apiKey,
            });

            console.log('Claude Vision client initialized');
        }

        return this.client;
    }

    async analyzeEmergencyFrame(
        frameBase64: string,
        callId: string,
        emergencyType: string,
        recentTranscript?: string
    ): Promise<{ analysis: FrameAnalysis; imagePath: string }> {
        try {
            console.log('Analyzing video frame with Claude Vision...');

            // Get client
            const client = this.getClient();

            // Save image to disk
            const imagePath = await this.saveFrame(frameBase64, callId);

            // Remove data URL prefix if present
            const imageData = frameBase64.replace(/^data:image\/[a-z]+;base64,/, '');

            const prompt = `You are an emergency response AI analyzing a live video feed from a 911 call.

EMERGENCY TYPE: ${emergencyType}
${recentTranscript ? `RECENT CONVERSATION:\n${recentTranscript}` : ''}

Analyze this video frame and provide a structured emergency assessment:

1. VISIBLE HAZARDS: List any immediate dangers you can see (fire, smoke, weapons, broken glass, flooding, chemical spills, structural damage, electrical hazards, etc.)

2. INJURIES/MEDICAL: Describe any visible injuries, blood, unconscious persons, or signs of medical distress (difficulty breathing, holding body parts, facial expressions of pain, etc.)

3. ENVIRONMENT: Assess the location type (indoor/outdoor, residential/commercial/vehicle), safety for first responders, accessibility (stairs, narrow hallways, etc.), lighting conditions, weather if visible

4. URGENCY LEVEL: Rate as low/medium/high/critical based on immediate threat to life and need for rapid response

5. RECOMMENDATIONS: Specific actionable steps for the operator or incoming emergency units (equipment needed, number of units, special precautions, etc.)

6. Be extremely detailed and thorough!!! Note down EVERYTHING you see even if there is no emergency.

Be extremely detailed and thorough. Lives depend on catching every detail. Focus on actionable intelligence.`;

            const response = await client.messages.create({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: 'image/jpeg',
                                    data: imageData,
                                },
                            },
                            {
                                type: 'text',
                                text: prompt,
                            },
                        ],
                    },
                ],
                temperature: 0.3,
            });

    
            let analysisText = 'Unable to analyze frame';
            if (response.content && response.content.length > 0) {
                const firstContent = response.content[0];
                if (firstContent && firstContent.type === 'text') {
                    analysisText = firstContent.text;
                }
            }

            // Parse the response into structured data
            const analysis = this.parseAnalysis(analysisText);

            console.log('✅ Frame analysis complete:', analysis.urgencyLevel, '-', analysis.hazards.length, 'hazards detected');

            return { analysis, imagePath };
        } catch (error: any) {
            console.error('Vision analysis error:', error.message);
            throw new Error('Failed to analyze frame: ' + error.message);
        }
    }

    private async saveFrame(frameBase64: string, callId: string): Promise<string> {
        // Remove data URL prefi
        const base64Data = frameBase64.replace(/^data:image\/[a-z]+;base64,/, '');

        // Create filename
        const timestamp = Date.now();
        const filename = `${callId}_${timestamp}.jpg`;
        const filepath = path.join(this.imageStoragePath, filename);

        fs.writeFileSync(filepath, base64Data, 'base64');
        console.log('💾 Saved frame:', filename);

        return filepath;
    }

    private parseAnalysis(text: string): FrameAnalysis {
        const urgencyMatch = text.toLowerCase().match(/urgency.*?(low|medium|high|critical)/);
        const urgencyLevel = (urgencyMatch?.[1] || 'medium') as FrameAnalysis['urgencyLevel'];

        return {
            timestamp: new Date().toISOString(),
            hazards: this.extractList(text, 'HAZARD|DANGER|VISIBLE HAZARDS'),
            injuries: this.extractList(text, 'INJUR|MEDICAL|BLOOD|UNCONSCIOUS|DISTRESS'),
            environmentAssessment: this.extractSection(text, 'ENVIRONMENT') || 'Assessment in progress',
            urgencyLevel,
            recommendations: this.extractList(text, 'RECOMMENDATION'),
            rawAnalysis: text,
        };
    }

    private extractList(text: string, keyword: string): string[] {
        const regex = new RegExp(`${keyword}[^:]*:([^\\n]*(?:\\n[-•*]?\\s*[^\\n]*)*)`, 'i');
        const match = text.match(regex);
        if (!match || !match[1]) return [];

        return match[1]
            .split(/\n[-•*]|\n\d+\./)
            .map(item => item.trim())
            .filter(item => {
                if (item.length === 0) return false;
                if (item.match(/^(none|n\/a|not visible|no visible)/i)) return false;
                if (item.length < 5) return false;
                return true;
            });
    }

    private extractSection(text: string, keyword: string): string | null {
        const regex = new RegExp(`${keyword}[^:]*:([^\\n]+(?:\\n(?!\\d+\\.|[A-Z]+:)[^\\n]+)*)`, 'i');
        const match = text.match(regex);
        return (match && match[1]) ? match[1].trim() : null;
    }

    getStoredFrames(callId: string): string[] {
        const files = fs.readdirSync(this.imageStoragePath);
        return files
            .filter(f => f.startsWith(callId))
            .map(f => path.join(this.imageStoragePath, f));
    }

    deleteCallFrames(callId: string): void {
        const frames = this.getStoredFrames(callId);
        frames.forEach(filepath => {
            try {
                fs.unlinkSync(filepath);
            } catch (error) {
                console.error('Error deleting frame:', error);
            }
        });
        console.log(`Deleted ${frames.length} frames for call ${callId}`);
    }
}

export default new VisionAnalysisService();