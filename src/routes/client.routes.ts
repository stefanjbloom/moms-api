import express from 'express';
import { PrismaClient } from '@prisma/client';
import { validateClient } from '../validations/client.validation';

const clientRouter = express.Router();
const prisma = new PrismaClient();

// Helper function to get the client ID based on environment
const getClientId = async () => {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('SEEDED_CLIENT_ID:', process.env.SEEDED_CLIENT_ID);
  
  // In test environment, always use the first client
  if (process.env.NODE_ENV === 'test') {
    const firstClient = await prisma.client.findFirst();
    console.log('Test environment - First client ID:', firstClient?.id);
    return firstClient?.id;
  }
  
  // In production, first try to find the seeded client
  if (process.env.SEEDED_CLIENT_ID) {
    const seededClient = await prisma.client.findUnique({
      where: { id: process.env.SEEDED_CLIENT_ID }
    });
    console.log('Production - Seeded client found:', !!seededClient);
    if (seededClient) {
      return seededClient.id;
    }
  }
  
  // If no seeded client exists, fall back to the first client
  const firstClient = await prisma.client.findFirst();
  console.log('Fallback - First client ID:', firstClient?.id);
  return firstClient?.id;
};

clientRouter.get('/', async (req, res) => {
  try {
    console.log('GET /api/client - Starting request');
    const clientId = await getClientId();
    console.log('GET /api/client - Client ID:', clientId);
    
    if (!clientId) {
      console.log('GET /api/client - No client ID found');
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        services: true,
        testimonials: true,
        blogPosts: true,
      },
    });

    if (!client) {
      console.log('GET /api/client - Client not found in database');
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    console.log('GET /api/client - Successfully found client');
    res.json(client);
  } catch (error) {
    console.error('GET /api/client - Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

clientRouter.put('/', validateClient, async (req, res) => {
  try {
    const clientId = await getClientId();
    if (!clientId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: req.body,
    });

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

clientRouter.get('/services', async (req, res) => {
  try {
    const clientId = await getClientId();
    if (!clientId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const services = await prisma.service.findMany({
      where: { clientId },
    });

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

clientRouter.get('/testimonials', async (req, res) => {
  try {
    const clientId = await getClientId();
    if (!clientId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const testimonials = await prisma.testimonial.findMany({
      where: { clientId },
    });

    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

clientRouter.get('/blog-posts', async (req, res) => {
  try {
    const clientId = await getClientId();
    if (!clientId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const blogPosts = await prisma.blogPost.findMany({
      where: { clientId },
    });

    res.json(blogPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default clientRouter;