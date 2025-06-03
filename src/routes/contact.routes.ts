import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { contactSchema } from '../validations/contact.validation';

const contactRouter = express.Router();
const prisma = new PrismaClient();

contactRouter.post('/', async (req: Request, res: Response) => {
  const { error, value } = contactSchema.validate(req.body, { abortEarly: false });

  if (error) {
    res.status(400).json({ 
      message: error.details[0].message 
    });
    return;
  }

  try {
    const contactRequest = await prisma.contactRequest.create({
      data: value,
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
});

export default contactRouter;