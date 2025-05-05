import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';
import '../__tests__/setup';

const prisma = new PrismaClient();

describe('Client Routes', () => {
  // Test data
  const testClient = {
    name: 'Test Client',
    aboutMe: 'This is a test client',
    email: 'test@example.com',
  };

  const testService = {
    title: 'Test Service',
    description: 'This is a test service',
    price: 99.99,
  };

  const testAppointment = {
    clientFirstName: 'John',
    clientLastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    date: new Date('2024-04-20T10:00:00Z'),
  };

  const testTestimonial = {
    title: 'Great Experience',
    content: 'Great service!',
    author: 'Test Author',
  };

  const testBlogPost = {
    title: 'Test Blog Post',
    content: 'This is a test blog post',
  };

  let createdClientId: string;
  let createdServiceId: string;

  beforeEach(async () => {
    try {
      // Clean up in reverse order to avoid foreign key constraints
      await prisma.appointment.deleteMany();
      await prisma.testimonial.deleteMany();
      await prisma.blogPost.deleteMany();
      await prisma.service.deleteMany();
      await prisma.client.deleteMany();

      // Create a client for tests
      const client = await prisma.client.create({
        data: testClient,
      });
      createdClientId = client.id;

      // Create a service for the client
      const service = await prisma.service.create({
        data: {
          ...testService,
          clientId: createdClientId,
        },
      });
      createdServiceId = service.id;

      // Create an appointment for the service
      await prisma.appointment.create({
        data: {
          ...testAppointment,
          serviceId: createdServiceId,
        },
      });

      // Create testimonial for the client
      await prisma.testimonial.create({
        data: {
          ...testTestimonial,
          clientId: createdClientId,
        },
      });

      // Create blog post for the client
      await prisma.blogPost.create({
        data: {
          ...testBlogPost,
          clientId: createdClientId,
        },
      });

      // Verify that all records were created
      const createdClient = await prisma.client.findUnique({
        where: { id: createdClientId },
        include: {
          services: true,
          testimonials: true,
          blogPosts: true,
        },
      });

      if (!createdClient) {
        throw new Error('Client was not created properly');
      }

      if (createdClient.services.length === 0) {
        throw new Error('Service was not created properly');
      }

      if (createdClient.testimonials.length === 0) {
        throw new Error('Testimonial was not created properly');
      }

      if (createdClient.blogPosts.length === 0) {
        throw new Error('Blog post was not created properly');
      }
    } catch (error) {
      console.error('Error in beforeEach:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/client', () => {
    it('should return client profile with related data', async () => {
      const response = await request(app)
        .get('/api/client')
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testClient.name);
      expect(response.body.aboutMe).toBe(testClient.aboutMe);
      expect(response.body.email).toBe(testClient.email);
      expect(Array.isArray(response.body.services)).toBe(true);
      expect(response.body.services.length).toBeGreaterThan(0);
      expect(Array.isArray(response.body.testimonials)).toBe(true);
      expect(response.body.testimonials.length).toBeGreaterThan(0);
      expect(Array.isArray(response.body.blogPosts)).toBe(true);
      expect(response.body.blogPosts.length).toBeGreaterThan(0);
    });

    it('should return 404 if client not found', async () => {
      // Delete the client first
      await prisma.client.delete({
        where: { id: createdClientId },
      });

      const response = await request(app)
        .get('/api/client')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/client', () => {
    it('should update client profile', async () => {
      const updatedData = {
        name: 'Updated Client',
        aboutMe: 'This is an updated client',
        email: 'updated@example.com',
      };

      const response = await request(app)
        .put('/api/client')
        .send(updatedData)
        .expect(200);

      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.aboutMe).toBe(updatedData.aboutMe);
      expect(response.body.email).toBe(updatedData.email);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .put('/api/client')
        .send({ name: 'Incomplete Client' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/client/services', () => {
    it('should return client services', async () => {
      const response = await request(app)
        .get('/api/client/services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('clientId');
      expect(response.body[0].clientId).toBe(createdClientId);
    });
  });

  describe('GET /api/client/testimonials', () => {
    it('should return client testimonials', async () => {
      const response = await request(app)
        .get('/api/client/testimonials')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('clientId');
      expect(response.body[0].clientId).toBe(createdClientId);
    });
  });

  describe('GET /api/client/blog-posts', () => {
    it('should return client blog posts', async () => {
      const response = await request(app)
        .get('/api/client/blog-posts')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('clientId');
      expect(response.body[0].clientId).toBe(createdClientId);
    });
  });
}); 