import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET all subjects - accessible by all authenticated users
router.get('/', authorize('admin', 'staff', 'guardian', 'student'), getAllSubjects);

// GET subject by ID
router.get('/:id', authorize('admin', 'staff', 'guardian', 'student'), getSubjectById);

// POST create new subject - admin and staff only
router.post('/', authorize('admin', 'staff'), createSubject);

// PUT/PATCH update subject - admin and staff only
router.put('/:id', authorize('admin', 'staff'), updateSubject);
router.patch('/:id', authorize('admin', 'staff'), updateSubject);

// DELETE subject - admin only
router.delete('/:id', authorize('admin'), deleteSubject);

export default router;
