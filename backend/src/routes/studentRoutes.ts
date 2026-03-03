import { Router } from 'express';
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentDocument,
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('admin', 'staff'), getAllStudents);
router.get('/:id', authorize('admin', 'staff', 'student', 'guardian'), getStudentById);
router.post('/', authorize('admin'), upload.single('image'), createStudent);
router.put('/:id', authorize('admin', 'staff'), upload.single('image'), updateStudent);
router.patch('/:id', authorize('admin', 'staff'), upload.single('image'), updateStudent);
router.delete('/:id', authorize('admin'), deleteStudent);
router.post('/:id/documents', authorize('admin', 'staff'), upload.single('document'), uploadStudentDocument);

export default router;
