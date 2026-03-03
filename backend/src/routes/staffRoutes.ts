import { Router } from 'express';
import {
  getAllStaff,
  getStaffById,
  getMyStaffProfile,
  createStaff,
  updateStaff,
  deleteStaff,
  uploadStaffDocument,
  resetStaffPasswordsToPhoneNumbers,
  debugStaffLogin,
  getStaffByClass,
} from '../controllers/staffController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin'), getAllStaff);
router.post('/reset-passwords', authorize('admin'), resetStaffPasswordsToPhoneNumbers);
router.get('/debug/:email', authorize('admin'), debugStaffLogin);
router.get('/by-class/:className', authorize('admin', 'guardian'), getStaffByClass);
// special route for logged-in staff to fetch their own profile
router.get('/me', authorize('admin','staff','guardian'), getMyStaffProfile);
router.get('/:id', authorize('admin', 'staff'), getStaffById);
router.post('/', authorize('admin'), upload.single('image'), createStaff);
router.put('/:id', authorize('admin'), upload.single('image'), updateStaff);
router.patch('/:id', authorize('admin'), upload.single('image'), updateStaff);
router.delete('/:id', authorize('admin'), deleteStaff);
router.post('/:id/documents', authorize('admin'), upload.single('document'), uploadStaffDocument);

export default router;
