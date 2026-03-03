import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadResult, getStudentResults, saveStudentTermReport } from '../controllers/resultController.js';
import { authenticate, authorize } from '../middleware/auth.js';

// Configure multer for Excel file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/results/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'result-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for Excel files only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /xlsx|xls/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   file.mimetype === 'application/vnd.ms-excel';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for Excel files
  },
  fileFilter,
});

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get student results by student ID
router.get('/students/:id/results', getStudentResults);

// Save student term report
router.put('/students/:id/term-report', authorize('admin', 'staff'), saveStudentTermReport);

// Upload result file
router.post('/uploadresult', authorize('admin', 'staff'), upload.single('file'), uploadResult);

export default router;
