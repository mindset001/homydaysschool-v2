import { Router } from 'express';
import { generateTemplate, downloadTemplate, listTemplates, cleanupTemplates } from '../controllers/templateController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Generate result template
router.post('/generatetemplate', authorize('admin', 'staff'), generateTemplate);

// Download template file
router.get('/templates/download/:filename', authorize('admin', 'staff'), downloadTemplate);

// List all available templates
router.get('/templates', authorize('admin', 'staff'), listTemplates);

// Clean up old template files (admin only)
router.delete('/templates/cleanup', authorize('admin'), cleanupTemplates);

export default router;