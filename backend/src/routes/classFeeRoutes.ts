import { Router } from 'express';
import { getClassFees, setClassFee, deleteClassFee } from '../controllers/classFeeController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'staff'), getClassFees);
router.put('/', authorize('admin'), setClassFee);
router.delete('/:id', authorize('admin'), deleteClassFee);

export default router;
