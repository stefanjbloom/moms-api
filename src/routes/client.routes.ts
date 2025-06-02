import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateClient } from '../validations/client.validation';

const clientRouter: Router = express.Router();
const prisma = new PrismaClient();

// Get all clients
clientRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get client by ID
clientRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id }
    });
    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create new client
clientRouter.post('/', validateClient, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await prisma.client.create({
      data: req.body
    });
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
clientRouter.put('/:id', validateClient, async (req: Request, res: Response): Promise<void> => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
clientRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.client.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get all services
clientRouter.get('/services', async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get service by ID
clientRouter.get('/services/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: req.params.id }
    });
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Get all testimonials
clientRouter.get('/testimonials', async (_req: Request, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany();
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

// Get testimonial by ID
clientRouter.get('/testimonials/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id: req.params.id }
    });
    if (!testimonial) {
      res.status(404).json({ error: 'Testimonial not found' });
      return;
    }
    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch testimonial' });
  }
});

// Get all blog posts
clientRouter.get('/blog-posts', async (_req: Request, res: Response): Promise<void> => {
  try {
    const blogPosts = await prisma.blogPost.findMany();
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get blog post by ID
clientRouter.get('/blog-posts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: req.params.id }
    });
    if (!blogPost) {
      res.status(404).json({ error: 'Blog post not found' });
      return;
    }
    res.json(blogPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

export default clientRouter;