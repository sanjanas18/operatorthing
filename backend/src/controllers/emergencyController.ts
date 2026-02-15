
import type { Request, Response } from 'express';
import ZoomService from '../services/ZoomService.js';
import PerplexityService from '../services/PerplexityService.js';
import VisionAnalysisService from '../services/VisionAnalysisService.js';

const activeCalls = new Map();
const completedCalls = new Map(); 

import ZoomRecordingService from '../services/ZoomRecordingService.js';

export const getCallRecording = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    
    if (!callId || typeof callId !== 'string') {
      return res.status(400).json({ error: 'Invalid callId' });
    }
    
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }
    
    const recording = await ZoomRecordingService.getRecording(call.meetingNumber);

    res.json(recording);
  } catch (error: any) {
    console.error('Error fetching recording:', error);
    res.status(500).json({ error: error.message });
  }
};


export const createCall = async (req: Request, res: Response) => {
  try {
    const { emergencyType, location, userInfo } = req.body;

    if (!emergencyType || !location) {
      return res.status(400).json({ error: 'Missing emergencyType or location' });
    }

    const meeting = await ZoomService.createMeeting({ emergencyType, location });
    const callerSignature = ZoomService.getCallerSignature(meeting.meetingNumber);

    const callId = `call_${Date.now()}`;

    const callData = {
      callId,
      meetingNumber: meeting.meetingNumber,
      password: meeting.password || '',
      emergencyType,
      location,
      userInfo: userInfo || {}, 
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    activeCalls.set(callId, callData);

    res.json({
      callId,
      meetingNumber: meeting.meetingNumber,
      password: meeting.password || '',
      signature: callerSignature,
      sdkKey: meeting.sdkKey,
      userName: meeting.callerId,
      location,
      emergencyType,
      userInfo: callData.userInfo,
    });
  } catch (error: any) {
    console.error('Error creating call:', error);
    res.status(500).json({ error: error.message });
  }
};

export const joinCall = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const operatorSignature = ZoomService.getOperatorSignature(call.meetingNumber);

    res.json({
      callId,
      meetingNumber: call.meetingNumber,
      password: call.password,
      signature: operatorSignature,
      sdkKey: process.env.ZOOM_SDK_KEY,
      userName: `operator_${Date.now()}`,
      emergencyType: call.emergencyType,
      location: call.location,
    });
  } catch (error: any) {
    console.error('Error joining call:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActiveCalls = (req: Request, res: Response) => {
  const calls = Array.from(activeCalls.values());
  res.json({ calls });
};

export const getCallDetails = (req: Request, res: Response) => {
  const { callId } = req.params;
  const call = activeCalls.get(callId);

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  res.json(call);
};

export const endCall = (req: Request, res: Response) => {
  const { callId } = req.params;
  const call = activeCalls.get(callId);

  if (!call) {
    return res.status(404).json({ error: 'Call not found' });
  }

  call.status = 'ended';
  call.endedAt = new Date().toISOString();

  res.json({ message: 'Call ended', call });
};

export const generateReport = async (req: Request, res: Response) => {
  try {
    const { transcript, emergencyType, location, callId, videoAnalyses } = req.body;

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    console.log('Generating report for', transcript.length, 'transcript items');

    // Get user info from active call
    let userInfo = null;
    if (callId) {
      const call = activeCalls.get(callId);
      if (call && call.userInfo) {
        userInfo = call.userInfo;
        console.log('Including user info:', userInfo.name);
      }
    }

    const report = await PerplexityService.generateReport(
      transcript,
      emergencyType || 'unknown',
      location || {},
      userInfo,  
      videoAnalyses, 
      callId
    );

    res.json({ report });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
};

// Store video frames and analyses
const callVideoFrames = new Map<string, Array<{
  frameData: string;
  imagePath: string;
  analysis: any;
  timestamp: string;
}>>();

export const analyzeVideoFrame = async (req: Request, res: Response) => {
  try {
    const { callId, frameData, emergencyType, recentTranscript } = req.body;

    if (!callId || !frameData || typeof callId !== 'string') {
      return res.status(400).json({ error: 'Missing callId or frameData' });
    }

    console.log(' Analyzing video frame for call:', callId);

    // Analyze the frame
    const { analysis, imagePath } = await VisionAnalysisService.analyzeEmergencyFrame(
      frameData,
      callId,
      emergencyType || 'unknown',
      recentTranscript
    );

    // Store frame analysis
    if (!callVideoFrames.has(callId)) {
      callVideoFrames.set(callId, []);
    }
    
    const frames = callVideoFrames.get(callId)!;
    frames.push({
      frameData,
      imagePath,
      analysis,
      timestamp: new Date().toISOString(),
    });

    // Keep only last 20 frames
    if (frames.length > 20) {
      frames.shift();
    }

    res.json({ 
      analysis,
      imagePath,
      totalFramesAnalyzed: frames.length 
    });
  } catch (error: any) {
    console.error('Error analyzing frame:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCallReport = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

     if (!callId || typeof callId !== 'string') {
      return res.status(400).json({ error: 'Invalid callId' });
    }

    // Get all analyses for this call
    const videoFrames = callVideoFrames.get(callId) || [];
    
    res.json({
      call,
      videoAnalyses: videoFrames.map(f => ({
        timestamp: f.timestamp,
        analysis: f.analysis,
        imagePath: f.imagePath,
      })),
      totalFrames: videoFrames.length,
    });
  } catch (error: any) {
    console.error('Error getting call report:', error);
    res.status(500).json({ error: error.message });
  }
};

export const downloadCallData = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    
    if (!callId || typeof callId !== 'string') {
      return res.status(400).json({ error: 'Invalid callId' });
    }
    
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const videoFrames = callVideoFrames.get(callId) || [];
    const storedImages = VisionAnalysisService.getStoredFrames(callId);

    // Try to get recording
    let recordingData = {
      available: false,
      status: 'not_ready',
      message: 'Recording will be available 5-10 minutes after call ends',
    };
    
    try {
      recordingData = await ZoomRecordingService.getRecording(call.meetingNumber);
    } catch (error) {
      console.log('Recording not available yet');
    }

    const completeReport = {
      reportMetadata: {
        reportId: `EMRG-${callId.slice(-8).toUpperCase()}`,
        generatedAt: new Date().toISOString(),
        callDuration: call.endedAt 
          ? Math.floor((new Date(call.endedAt).getTime() - new Date(call.createdAt).getTime()) / 1000)
          : null,
      },
      callInfo: {
        callId: call.callId,
        emergencyType: call.emergencyType,
        location: call.location,
        status: call.status,
        startTime: call.createdAt,
        endTime: call.endedAt || new Date().toISOString(),
      },
      videoAnalyses: videoFrames.map(f => ({
        timestamp: f.timestamp,
        urgencyLevel: f.analysis.urgencyLevel,
        hazards: f.analysis.hazards,
        injuries: f.analysis.injuries,
        environment: f.analysis.environmentAssessment,
        recommendations: f.analysis.recommendations,
      })),
      recording: recordingData, 
      savedImagePaths: storedImages,
      totalFramesAnalyzed: videoFrames.length,
      reportGeneratedAt: new Date().toISOString(),
    };

    res.json(completeReport);
  } catch (error: any) {
    console.error('Error downloading call data:', error);
    res.status(500).json({ error: error.message });
  }
};

export const checkRecordingStatus = async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    
    if (!callId || typeof callId !== 'string') {
      return res.status(400).json({ error: 'Invalid callId' });
    }
    
    console.log('Looking for call:', callId);
    console.log('Active calls:', Array.from(activeCalls.keys()));
    
    const call = activeCalls.get(callId);

    if (!call) {
      return res.status(404).json({ 
        error: 'Call not found',
        callId: callId,
        availableCalls: Array.from(activeCalls.keys()),
      });
    }

    console.log('Found call:', call.callId, 'Meeting:', call.meetingNumber);

    try {
      const recording = await ZoomRecordingService.getRecording(call.meetingNumber);
      
      res.json({
        callId: call.callId,
        meetingNumber: call.meetingNumber,
        recording,
        debugInfo: {
          callEnded: call.endedAt,
          minutesSinceEnd: call.endedAt 
            ? Math.floor((Date.now() - new Date(call.endedAt).getTime()) / 1000 / 60)
            : null,
        },
      });
    } catch (error: any) {
      console.error('Recording check error:', error.response?.data || error.message);
      res.json({
        callId: call.callId,
        meetingNumber: call.meetingNumber,
        recording: {
          available: false,
          message: 'Recording not ready yet',
        },
        debugInfo: {
          callEnded: call.endedAt,
          minutesSinceEnd: call.endedAt 
            ? Math.floor((Date.now() - new Date(call.endedAt).getTime()) / 1000 / 60)
            : null,
        },
      });
    }
  } catch (error: any) {
    console.error('Error checking recording:', error);
    res.status(500).json({ error: error.message });
  }
};

// export const saveCompletedCall = async (req: Request, res: Response) => {
//   try {
//     const { callId, transcript, videoAnalyses, aiReport, startTime, endTime, userInfo, emergencyType, location } = req.body;

//     if (!callId) {
//       return res.status(400).json({ error: 'callId is required' });
//     }

//     const completeCallData = {
//       callId,
//       userInfo,
//       emergencyType,
//       location,
//       transcript,
//       videoAnalyses,
//       aiReport,
//       startTime,
//       endTime,
//       savedAt: new Date().toISOString(),
//     };

//     completedCalls.set(callId, completeCallData);
    
//     console.log('Completed call saved:', callId);

//     res.json({ success: true, message: 'Call data saved' });
//   } catch (error: any) {
//     console.error('Error saving completed call:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

export const saveCompletedCall = async (req: Request, res: Response) => {
  try {
    const { callId, transcript, videoAnalyses, aiReport, startTime, endTime, userInfo, emergencyType, location } = req.body;

    if (!callId) {
      return res.status(400).json({ error: 'callId is required' });
    }

    const completeCallData = {
      callId,
      userInfo,
      emergencyType,
      location,
      transcript,
      videoAnalyses,
      aiReport,
      startTime,
      endTime,
      savedAt: new Date().toISOString(),
    };

    completedCalls.set(callId, completeCallData);
    
    activeCalls.delete(callId);
    

    res.json({ success: true, message: 'Call data saved' });
  } catch (error: any) {
    console.error('Error saving completed call:', error);
    res.status(500).json({ error: error.message });
  }
};

export { activeCalls, completedCalls };
