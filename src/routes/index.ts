// Centralized Router AFTER src/index

import express from "express";
import clientRouter from './client.routes';
import serviceRouter from './service.routes';
import appointmentRouter from './appointment.routes';
import testimonialRouter from './testimonial.routes';
import blogPostRouter from './blogPost.routes';
import { adminAuth } from '../middleware/auth';

const router = express.Router();

// Public routes (no authentication needed)
router.use('/appointments', appointmentRouter);

// Protected routes (require admin authentication)
router.use('/services', adminAuth, serviceRouter);
router.use('/client', adminAuth, clientRouter);
router.use('/testimonials', adminAuth, testimonialRouter);
router.use('/blog', adminAuth, blogPostRouter);

export default router;