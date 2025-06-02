import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const contactRouter = express.Router();
const prisma = new PrismaClient();

interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

contactRouter.post('/', async (req: Request, res: Response) => {
  const { name, email, message } = req.body as ContactRequestBody;

  if (!name || !email || !message) {
    res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const contactRequest = await prisma.contactRequest.create({
      data: { name, email, message },
    });
    res.status(201).json(contactRequest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

contactRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const contactRequests = await prisma.contactRequest.findMany();
    res.json(contactRequests);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

contactRouter.delete('/:id', async (req: Request, res: Response) => {
  await prisma.contactRequest.delete({
    where: { id: req.params.id }
  });
  res.status(204).send();
  return;
});

export default contactRouter;