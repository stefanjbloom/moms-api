// Centralized Router AFTER src/index

import express from "express";
import clientRouter from './client.routes';
import serviceRouter from './service.routes';
import appointmentRouter from './appointment.routes';
import contactRouter from './contact.routes';

const router = express.Router();

//Mounting of routes

router.use('/client', clientRouter)
router.use('/services', serviceRouter)
router.use('/appointments', appointmentRouter)
router.use('/contact', contactRouter)

export default router;