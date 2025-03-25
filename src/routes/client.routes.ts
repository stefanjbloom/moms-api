import express from 'express';
import { PrismaClient } from '@prisma/client';

const clientRouter = express.Router();
const prisma = new PrismaClient();

clientRouter.get('/', async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: '1' },
      include: {
        services: true,
        testimonials: true,
        blogPosts: true,
      },
    });
    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default clientRouter;