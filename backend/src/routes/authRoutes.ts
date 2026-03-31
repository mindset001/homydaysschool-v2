import { Router } from 'express';
import { register, login, guardianLogin, refreshToken, logout, testCredentials, changePassword, adminResetPassword } from '../controllers/authController.js';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';

// Validation error middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation error', 
      errors: errors.array() 
    });
  }
  next();
};

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['admin', 'staff', 'student', 'guardian']).withMessage('Invalid role'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/test-credentials', testCredentials);
router.post(
  '/admin/reset-password',
  authenticate,
  [
    body('targetType').isIn(['student', 'staff']).withMessage('targetType must be student or staff'),
    body('targetId').notEmpty().withMessage('targetId is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  handleValidationErrors,
  adminResetPassword
);
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  handleValidationErrors,
  changePassword
);
router.post(
  '/guardian-login',
  [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  guardianLogin
);

export default router;
