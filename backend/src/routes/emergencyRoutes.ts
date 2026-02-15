import express from 'express';
import {
  createCall,
  joinCall,
  getActiveCalls,
  getCallDetails,
  endCall,
generateReport,

    getCallRecording,
  analyzeVideoFrame,
  getCallReport,
  downloadCallData,
    checkRecordingStatus,
} from '../controllers/emergencyController.js';
import { saveCompletedCall } from '../controllers/emergencyController.js';


const router = express.Router();

router.post('/create', createCall);           // Create new call
router.get('/join/:callId', joinCall);         // Join existing call
router.get('/active', getActiveCalls);         // List all calls
router.get('/:callId', getCallDetails);        // Get call info
router.post('/:callId/end', endCall);          // End call
router.post('/generate-report', generateReport); 
router.get('/recording/:callId', getCallRecording);
router.get('/recording-status/:callId', checkRecordingStatus);
router.post('/analyze-frame', analyzeVideoFrame);
router.get('/report/:callId', getCallReport);
router.get('/download/:callId', downloadCallData);
router.post('/save-completed', saveCompletedCall);

export default router;