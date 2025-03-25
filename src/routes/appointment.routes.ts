import express from 'express';
import { PrismaClient } from '@prisma/client';

const appointmentRouter = express.Router();
const prisma = new PrismaClient();

appointmentRouter.get('/', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default appointmentRouter;