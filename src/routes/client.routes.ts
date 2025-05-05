import express from 'express';
import { PrismaClient } from '@prisma/client';

const clientRouter = express.Router();
const prisma = new PrismaClient();

// Helper function to get the client ID based on environment
const getClientId = async () => {
  // In test environment, always use the first client
  if (process.env.NODE_ENV === 'test') {
    const firstClient = await prisma.client.findFirst();
    return firstClient?.id;
  }
  // In production, use SEEDED_CLIENT_ID until we have a better way to handle this.  PUT clients info in production and database.
  return process.env.SEEDED_CLIENT_ID;
};

clientRouter.get('/', async (req, res) => {
  try {
    const clientId = await getClientId();
    if (!clientId) {
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
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

clientRouter.put('/', async (req, res) => {
  try {
    const { name, aboutMe, email } = req.body;
    
    if (!name || !aboutMe || !email) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const clientId = await getClientId();
    if (!clientId) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const client = await prisma.client.update({
      where: { id: clientId },
      data: { name, aboutMe, email },
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