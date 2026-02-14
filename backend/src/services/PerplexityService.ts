// import OpenAI from 'openai';

// interface TranscriptItem {
//   text: string;
//   speaker: string;
//   timestamp: string;
// }

// class PerplexityService {
//   private client: OpenAI;

//   constructor() {
//     this.client = new OpenAI({
//       apiKey: process.env.PERPLEXITY_API_KEY,
//       baseURL: 'https://api.perplexity.ai',
//     });
//   }

//   async generateReport(
//     transcript: TranscriptItem[],
//     emergencyType: string,
//     location: any
//   ): Promise<string> {
//     try {
//       console.log('🤖 Generating AI report...');

//       // Format transcript as conversation
//       const conversationText = transcript
//         .map(item => `[${item.speaker}]: ${item.text}`)
//         .join('\n');

//       const prompt = `You are an emergency dispatch AI assistant. Analyze this 911 call transcript and generate a concise incident report.

// EMERGENCY TYPE: ${emergencyType}
// LOCATION: ${location.address || `${location.latitude}, ${location.longitude}`}

// TRANSCRIPT:
// ${conversationText}

// Generate a brief incident report with:
// 1. SITUATION SUMMARY (2-3 sentences)
// 2. KEY DETAILS (injuries, hazards, urgency)
// 3. RECOMMENDED RESPONSE (what units to dispatch)
// 4. PRIORITY LEVEL (Low/Medium/High/Critical)

// Keep it under 150 words. Be direct and actionable.`;

//       const response = await this.client.chat.completions.create({
//         model: 'sonar',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an emergency dispatch AI. Provide concise, actionable incident reports.',
//           },
//           {
//             role: 'user',
//             content: prompt,
//           },
//         ],
//         max_tokens: 300,
//         temperature: 0.3,
//       });

//       const report = response.choices[0]?.message?.content || 'Unable to generate report';
//       console.log('✅ Report generated:', report.substring(0, 100) + '...');
      
//       return report;
//     } catch (error: any) {
//       console.error('❌ Perplexity error:', error.response?.data || error.message);
//       throw new Error('Failed to generate report: ' + error.message);
//     }
//   }
// }

// // export default new PerplexityService();
// const perplexityService = {
//   async generateReport(
//     transcript: TranscriptItem[],
//     emergencyType: string,
//     location: any
//   ): Promise<string> {
//     const service = new PerplexityService();
//     return service.generateReport(transcript, emergencyType, location);
//   }
// };

// export default perplexityService;


import OpenAI from 'openai';

interface TranscriptItem {
  text: string;
  speaker: string;
  timestamp: string;
}

class PerplexityService {
  private client: OpenAI | null = null;

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = process.env.PERPLEXITY_API_KEY;
      
      if (!apiKey) {
        throw new Error('❌ Missing PERPLEXITY_API_KEY in .env file');
      }

      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.perplexity.ai',
      });
      
      console.log('✅ Perplexity client initialized');
    }
    
    return this.client;
  }

  async generateReport(
    transcript: TranscriptItem[],
    emergencyType: string,
    location: any,
    videoAnalyses?: Array<{ timestamp: string; analysis: any }>
  ): Promise<string> {
    try {
      console.log('🤖 Generating AI report with Perplexity...');

      // Get client (lazy initialization)
      const client = this.getClient();

      // Format transcript
      const conversationText = transcript
        .map(item => `[${item.speaker}]: ${item.text}`)
        .join('\n');

      // Format video analysis if available
      let videoContext = '';
      if (videoAnalyses && videoAnalyses.length > 0) {
        const latestAnalysis = videoAnalyses[videoAnalyses.length - 1];
        
        if (latestAnalysis && latestAnalysis.analysis) {
          videoContext = `

LIVE VIDEO INTELLIGENCE (Claude Vision Analysis):
- Scene Urgency: ${latestAnalysis.analysis.urgencyLevel.toUpperCase()}
- Visible Hazards: ${latestAnalysis.analysis.hazards.length > 0 ? latestAnalysis.analysis.hazards.join(', ') : 'None detected'}
- Injuries Observed: ${latestAnalysis.analysis.injuries.length > 0 ? latestAnalysis.analysis.injuries.join(', ') : 'None visible'}
- Environment Assessment: ${latestAnalysis.analysis.environmentAssessment}
- Visual Recommendations: ${latestAnalysis.analysis.recommendations.slice(0, 2).join('; ')}`;
        }
      }

      const prompt = `You are an emergency dispatch AI assistant. Analyze this 911 call and generate a concise incident report.

EMERGENCY TYPE: ${emergencyType}
LOCATION: ${location.address || `${location.lat || location.latitude}, ${location.lng || location.longitude}`}

AUDIO TRANSCRIPT:
${conversationText}
${videoContext}

Generate a comprehensive emergency incident report with:

1. SITUATION SUMMARY (3-4 sentences that synthesize BOTH audio conversation and visual scene analysis)

2. CRITICAL DETAILS:
   - Injuries/Medical Conditions (from conversation AND visual confirmation)
   - Immediate Hazards (environmental dangers visible or described)
   - Scene Safety Assessment
   - Access/Approach Considerations

3. RECOMMENDED RESPONSE:
   - Units Required (ambulance, fire, police, specialized)
   - Special Equipment Needed
   - Estimated Response Priority

4. PRIORITY LEVEL: Low/Medium/High/CRITICAL (justify based on audio + video)

Keep report under 250 words. Be direct, factual, and actionable. Integrate visual and audio intelligence seamlessly.`;

      const response = await client.chat.completions.create({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an emergency dispatch AI. Provide concise, actionable incident reports that synthesize audio and visual intelligence.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      const report = response.choices[0]?.message?.content || 'Unable to generate report';
      console.log('✅ Report generated with video context');
      
      return report;
    } catch (error: any) {
      console.error('❌ Perplexity error:', error.response?.data || error.message);
      throw new Error('Failed to generate report: ' + error.message);
    }
  }
}

export default new PerplexityService();