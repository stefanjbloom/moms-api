import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateService } from '../validations/service.validation';

const serviceRouter: Router = express.Router();
const prisma = new PrismaClient();

// Public routes
// Get all services
serviceRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      where: { isPublished: true }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get service by ID
serviceRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.findUnique({
      where: { 
        id: req.params.id,
        isPublished: true
      }
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

// Admin routes (these will be protected by adminAuth middleware)
// Create new service
serviceRouter.post('/', validateService, async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.create({
      data: {
        ...req.body,
        isPublished: false // Default to unpublished
      }
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service
serviceRouter.put('/:id', validateService, async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
serviceRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.service.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Publish/unpublish service
serviceRouter.patch('/:id/publish', async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { isPublished: req.body.isPublished }
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update service status' });
  }
});

export default serviceRouter;