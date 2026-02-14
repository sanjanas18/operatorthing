import type { Request, Response } from 'express';
import ZoomService from '../services/ZoomService.js';

const activeCalls = new Map();

// ... your existing createCall and joinCall functions ...

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
      password: meeting.password || '',
      emergencyType,
      location,
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

// ✅ NEW: Function to remove call from backend
export const removeCall = (callId: string) => {
  console.log('🗑️ Removing call from backend:', callId);
  const deleted = activeCalls.delete(callId);
  if (deleted) {
    console.log('✅ Call removed successfully');
  } else {
    console.log('⚠️ Call not found in activeCalls');
  }
  return deleted;
};