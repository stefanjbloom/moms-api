import express, { Request, Response, Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const testimonialRouter: Router = express.Router();
const prisma = new PrismaClient();

// Get all testimonials
testimonialRouter.get('/', async (req: Request, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Create a new testimonial
testimonialRouter.post('/', async (req: Request, res: Response) => {
  try {
    const testimonial = await prisma.testimonial.create({
      data: req.body
    });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

export default testimonialRouter; 