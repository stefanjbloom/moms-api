import express, { Request, Response } from 'express';  // Explicitly import Request and Response
import { PrismaClient } from '@prisma/client';

const contactRouter = express.Router();
const prisma = new PrismaClient();

// Create an interface for the request body
interface ContactRequestBody {
  name: string;
  email: string;
  message: string;
}

contactRouter.post('/', async (req: Request<{}, {}, ContactRequestBody>, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
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

export default contactRouter;