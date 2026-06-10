import express from 'express';
import { 
  getAdminOverview, 
  getEmployees, 
  addEmployee, 
  editEmployee, 
  deleteEmployee, 
  getChatTranscripts, 
  getChatTranscriptById,
  downloadReport
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Admin', 'Super Admin'));

router.get('/overview', getAdminOverview);
router.get('/employees', getEmployees);
router.post('/employees', addEmployee);
router.put('/employees/:id', editEmployee);
router.delete('/employees/:id', deleteEmployee);
router.get('/transcripts', getChatTranscripts);
router.get('/transcripts/:id', getChatTranscriptById);
router.get('/reports/download', downloadReport);

export default router;
