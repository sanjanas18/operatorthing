import express from 'express';
import {
  createCall,
  joinCall,
  getActiveCalls,
  getCallDetails,
  endCall,
} from '../controllers/emergencyController.js';

const router = express.Router();

router.post('/create', createCall);           // Create new call
router.get('/join/:callId', joinCall);         // Join existing call
router.get('/active', getActiveCalls);         // List all calls
router.get('/:callId', getCallDetails);        // Get call info
router.post('/:callId/end', endCall);          // End call

export default router;