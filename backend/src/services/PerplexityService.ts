

// import OpenAI from 'openai';

// interface TranscriptItem {
//   text: string;
//   speaker: string;
//   timestamp: string;
// }

// class PerplexityService {
//   private client: OpenAI | null = null;

//   private getClient(): OpenAI {
//     if (!this.client) {
//       const apiKey = process.env.PERPLEXITY_API_KEY;
      
//       if (!apiKey) {
//         throw new Error('❌ Missing PERPLEXITY_API_KEY in .env file');
//       }

//       this.client = new OpenAI({
//         apiKey: apiKey,
//         baseURL: 'https://api.perplexity.ai',
//       });
      
//       console.log('✅ Perplexity client initialized');
//     }
    
//     return this.client;
//   }

//   async generateReport(
//     transcript: TranscriptItem[],
//     emergencyType: string,
//     location: any,
//     videoAnalyses?: Array<{ timestamp: string; analysis: any }>
//   ): Promise<string> {
//     try {
//       console.log('🤖 Generating AI report with Perplexity...');

//       // Get client (lazy initialization)
//       const client = this.getClient();

//       // Format transcript
//       const conversationText = transcript
//         .map(item => `[${item.speaker}]: ${item.text}`)
//         .join('\n');

//       // Format video analysis if available
//       let videoContext = '';
//       if (videoAnalyses && videoAnalyses.length > 0) {
//         const latestAnalysis = videoAnalyses[videoAnalyses.length - 1];
        
//         if (latestAnalysis && latestAnalysis.analysis) {
//           videoContext = `

// LIVE VIDEO INTELLIGENCE (Claude Vision Analysis):
// - Scene Urgency: ${latestAnalysis.analysis.urgencyLevel.toUpperCase()}
// - Visible Hazards: ${latestAnalysis.analysis.hazards.length > 0 ? latestAnalysis.analysis.hazards.join(', ') : 'None detected'}
// - Injuries Observed: ${latestAnalysis.analysis.injuries.length > 0 ? latestAnalysis.analysis.injuries.join(', ') : 'None visible'}
// - Environment Assessment: ${latestAnalysis.analysis.environmentAssessment}
// - Visual Recommendations: ${latestAnalysis.analysis.recommendations.slice(0, 2).join('; ')}`;
//         }
//       }

//       const prompt = `You are an emergency dispatch AI assistant. Analyze this 911 call and generate a concise incident report.

// EMERGENCY TYPE: ${emergencyType}
// LOCATION: ${location.address || `${location.lat || location.latitude}, ${location.lng || location.longitude}`}

// AUDIO TRANSCRIPT:
// ${conversationText}
// ${videoContext}

// Create a unified incident report that combines what the caller SAID with what Claude Vision SAW. Reconcile any differences.
// Things you may include:
// 1. SITUATION SUMMARY (3-4 sentences that synthesize BOTH audio conversation and visual scene analysis)

// 2. CRITICAL DETAILS:
//    - Injuries/Medical Conditions (from conversation AND visual confirmation)
//    - Immediate Hazards (environmental dangers visible or described)
//    - Scene Safety Assessment
//    - Access/Approach Considerations

// 3. RECOMMENDED RESPONSE:
//    - Units Required (ambulance, fire, police, specialized)
//    - Special Equipment Needed
//    - Estimated Response Priority

// 4. PRIORITY LEVEL: Low/Medium/High/CRITICAL (justify based on audio + video)

// Keep report under 250 words. Be direct, factual, and actionable. Integrate visual and audio intelligence seamlessly.`;

//       const response = await client.chat.completions.create({
//         model: 'sonar',
//         messages: [
//           {
//             role: 'system',
//             content: 'You are an emergency dispatch AI. Provide concise, actionable incident reports that synthesize audio and visual intelligence.',
//           },
//           {
//             role: 'user',
//             content: prompt,
//           },
//         ],
//         max_tokens: 500,
//         temperature: 0.3,
//       });

//       const report = response.choices[0]?.message?.content || 'Unable to generate report';
//       console.log('✅ Report generated with video context');
      
//       return report;
//     } catch (error: any) {
//       console.error('❌ Perplexity error:', error.response?.data || error.message);
//       throw new Error('Failed to generate report: ' + error.message);
//     }
//   }
// }

// export default new PerplexityService();

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
    callId?: string,
    userInfo?: any,  
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

      // ✅ FORMAT USER INFO
      let userInfoText = '';
      if (userInfo && userInfo.name) {
        userInfoText = `

CALLER INFORMATION:
- Name: ${userInfo.name || 'Unknown'}
- Age: ${userInfo.age || 'Unknown'}
- Contact: ${userInfo.phone || 'Not provided'}
- Medical History: ${userInfo.medicalConditions || 'None reported'}`;
        
        console.log('👤 Including caller info:', userInfo.name);
      }

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
${userInfoText}

AUDIO TRANSCRIPT:
${conversationText}
${videoContext}

Create a unified incident report that combines what the caller SAID with what Claude Vision SAW. Use the caller's name when referencing them. Reconcile any differences.

Include:
1. SITUATION SUMMARY (3-4 sentences - mention caller by name, synthesize audio + visual)

2. CRITICAL DETAILS:
   - Patient Information (age, pre-existing conditions from medical history)
   - Injuries/Medical Conditions (from conversation AND visual confirmation)
   - Immediate Hazards (environmental dangers visible or described)
   - Scene Safety Assessment
   - Access/Approach Considerations

3. RECOMMENDED RESPONSE:
   - Units Required (ambulance, fire, police, specialized)
   - Special Equipment/Personnel Needed (consider medical history)
   - Estimated Response Priority

4. PRIORITY LEVEL: Low/Medium/High/CRITICAL (justify based on audio + video + medical history)

Keep report under 300 words. Be direct, factual, and actionable. Reference the caller by name. Integrate visual and audio intelligence seamlessly.

At the end of the report, include:

---
CALL REFERENCE:
Call ID: ${callId || 'Unknown'}

For questions about this call, text FrontLine AI at:
https://poke.com/r/G-TGICJi2di

Text your Call ID to get your full report and ask questions anytime.`;


      const response = await client.chat.completions.create({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are an emergency dispatch AI. Provide concise, actionable incident reports that synthesize caller information, audio, and visual intelligence. Always use the caller\'s name when known.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 600,  // ✅ INCREASED for longer reports with user info
        temperature: 0.3,
      });

      const report = response.choices[0]?.message?.content || 'Unable to generate report';
      console.log('✅ Report generated with user info + video context');
      
      return report;
    } catch (error: any) {
      console.error('❌ Perplexity error:', error.response?.data || error.message);
      throw new Error('Failed to generate report: ' + error.message);
    }
  }
}

export default new PerplexityService();