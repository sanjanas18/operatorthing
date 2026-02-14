import express from 'express';
import {
  createCall,
  joinCall,
  getActiveCalls,
  getCallDetails,
  endCall,
generateReport,

  analyzeVideoFrame,
  getCallReport,
  downloadCallData,
} from '../controllers/emergencyController.js';

const router = express.Router();

router.post('/create', createCall);           // Create new call
router.get('/join/:callId', joinCall);         // Join existing call
router.get('/active', getActiveCalls);         // List all calls
router.get('/:callId', getCallDetails);        // Get call info
router.post('/:callId/end', endCall);          // End call
router.post('/generate-report', generateReport); 


router.post('/analyze-frame', analyzeVideoFrame);
router.get('/report/:callId', getCallReport);
router.get('/download/:callId', downloadCallData);

export default router;