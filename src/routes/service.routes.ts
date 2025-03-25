import express from 'express';
import { PrismaClient } from '@prisma/client';

const serviceRouter = express.Router();
const prisma = new PrismaClient();

serviceRouter.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default serviceRouter;