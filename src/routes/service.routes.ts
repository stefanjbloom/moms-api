import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const serviceRouter: Router = express.Router();
const prisma = new PrismaClient();

// Create a new service
serviceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;
    
    if (!title || !description || !price) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const service = await prisma.service.create({
      data: { title, description, price }
    });
    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all services
serviceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific service
serviceRouter.get('/:id', async (req: Request, res: Response) => {
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
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a service
serviceRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { title, description, price } = req.body;
    const service = await prisma.service.update({
      where: { id: req.params.id },
      data: { title, description, price }
    });
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a service
serviceRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.service.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default serviceRouter;