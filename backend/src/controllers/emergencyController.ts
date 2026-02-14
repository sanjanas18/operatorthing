// import type { Request, Response } from 'express';

// import ZoomService from '../services/ZoomService.js';

// const activeCalls = new Map();

// // Create emergency call
// export const createCall = async (req: Request, res: Response) => {
//   try {
//     const { emergencyType, location } = req.body;

//     if (!emergencyType || !location) {
//       return res.status(400).json({ error: 'Missing emergencyType or location' });
//     }

//     const meeting = ZoomService.createMeeting({ emergencyType, location });
//     const callerSignature = ZoomService.getCallerSignature(meeting.meetingNumber);

//     const callId = `call_${Date.now()}`;

//     const callData = {
//       callId,
//       meetingNumber: meeting.meetingNumber,
//       emergencyType,
//       location,
//       status: 'active',
//       createdAt: new Date().toISOString(),
//     };

//     activeCalls.set(callId, callData);

//     res.json({
//       callId,
//       meetingNumber: meeting.meetingNumber,
//       signature: callerSignature,
//       sdkKey: meeting.sdkKey,
//       userName: meeting.callerId,
//       location,
//       emergencyType,
//     });
//   } catch (error: any) {
//     console.error('Error creating call:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // Join call as operator
// export const joinCall = async (req: Request, res: Response) => {
//   try {
//     const { callId } = req.params;
//     const call = activeCalls.get(callId);

//     if (!call) {
//       return res.status(404).json({ error: 'Call not found' });
//     }

//     const operatorSignature = ZoomService.getOperatorSignature(call.meetingNumber);

//     res.json({
//       callId,
//       meetingNumber: call.meetingNumber,
//       signature: operatorSignature,
//       sdkKey: process.env.ZOOM_SDK_KEY,
//       userName: `operator_${Date.now()}`,
//       emergencyType: call.emergencyType,
//       location: call.location,
//     });
//   } catch (error: any) {
//     console.error('Error joining call:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// // Get all active calls
// export const getActiveCalls = (req: Request, res: Response) => {
//   const calls = Array.from(activeCalls.values());
//   res.json({ calls });
// };

// // Get single call details
// export const getCallDetails = (req: Request, res: Response) => {
//   const { callId } = req.params;
//   const call = activeCalls.get(callId);

//   if (!call) {
//     return res.status(404).json({ error: 'Call not found' });
//   }

//   res.json(call);
// };

// // End call
// export const endCall = (req: Request, res: Response) => {
//   const { callId } = req.params;
//   const call = activeCalls.get(callId);

//   if (!call) {
//     return res.status(404).json({ error: 'Call not found' });
//   }

//   call.status = 'ended';
//   call.endedAt = new Date().toISOString();

//   res.json({ message: 'Call ended', call });
// };


import type { Request, Response } from 'express';
import ZoomService from '../services/ZoomService.js';
import PerplexityService from '../services/PerplexityService.js';


const activeCalls = new Map();

// export const createCall = async (req: Request, res: Response) => {
//   try {
//     const { emergencyType, location } = req.body;

//     if (!emergencyType || !location) {
//       return res.status(400).json({ error: 'Missing emergencyType or location' });
//     }

//     const meeting = await ZoomService.createMeeting({ emergencyType, location });
//     const callerSignature = ZoomService.getCallerSignature(meeting.meetingNumber);

//     const callId = `call_${Date.now()}`;

//     const callData = {
//       callId,
//       meetingNumber: meeting.meetingNumber,
//       emergencyType,
//       location,
//       status: 'active',
//       createdAt: new Date().toISOString(),
//     };

//     activeCalls.set(callId, callData);

//     res.json({
//       callId,
//       meetingNumber: meeting.meetingNumber,
//       signature: callerSignature,
//       sdkKey: meeting.sdkKey,
//       userName: meeting.callerId,
//       location,
//       emergencyType,
//     });
//   } catch (error: any) {
//     console.error('Error creating call:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

export const createCall = async (req: Request, res: Response) => {
  try {
    const { emergencyType, location } = req.body;

    if (!emergencyType || !location) {
      return res.status(400).json({ error: 'Missing emergencyType or location' });
    }

    const meeting = await ZoomService.createMeeting({ emergencyType, location });
    const callerSignature = ZoomService.getCallerSignature(meeting.meetingNumber);

    const callId = `call_${Date.now()}`;

    const callData = {
      callId,
      meetingNumber: meeting.meetingNumber,
      password: meeting.password || '', // ← ADD THIS
      emergencyType,
      location,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    activeCalls.set(callId, callData);

    res.json({
      callId,
      meetingNumber: meeting.meetingNumber,
      password: meeting.password || '', // ← ADD THIS
      signature: callerSignature,
      sdkKey: meeting.sdkKey,
      userName: meeting.callerId,
      location,
      emergencyType,
    });
  } catch (error: any) {
    console.error('Error creating call:', error);
    res.status(500).json({ error: error.message });
  }
};

// export const joinCall = async (req: Request, res: Response) => {
//   try {
//     const { callId } = req.params;
//     const call = activeCalls.get(callId);

//     if (!call) {
//       return res.status(404).json({ error: 'Call not found' });
//     }

//     const operatorSignature = ZoomService.getOperatorSignature(call.meetingNumber);

//     res.json({
//       callId,
//       meetingNumber: call.meetingNumber,
//       signature: operatorSignature,
//       sdkKey: process.env.ZOOM_SDK_KEY,
//       userName: `operator_${Date.now()}`,
//       emergencyType: call.emergencyType,
//       location: call.location,
//     });
//   } catch (error: any) {
//     console.error('Error joining call:', error);
//     res.status(500).json({ error: error.message });
//   }
// };


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
      password: call.password, // ← MAKE SURE THIS LINE EXISTS
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
    const { transcript, emergencyType, location } = req.body;

    if (!transcript || !Array.isArray(transcript) || transcript.length === 0) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    console.log('📝 Generating report for', transcript.length, 'transcript items');

    const report = await PerplexityService.generateReport(
      transcript,
      emergencyType || 'unknown',
      location || {}
    );

    res.json({ report });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message });
  }
};