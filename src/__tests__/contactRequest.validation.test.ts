import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Test Setup', () => {
  it('should clean up the database before each test', async () => {
    // Clean up in the correct order
    await prisma.appointment.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.service.deleteMany();
    await prisma.client.deleteMany();
  });
});

describe('Contact Request Validation', () => {
  //Test data
  const testContactRequest = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    message: 'This is a test message'
  };

  describe('POST /api/contact', () => {
    it('should accept valid contact request data', async () => {
      const response = await request(app)
        .post('/api/contact')
        .send(testContactRequest)
        .expect(201);

      expect(response.body).toHaveProperty('name', testContactRequest.name);
      expect(response.body).toHaveProperty('email', testContactRequest.email);
      expect(response.body).toHaveProperty('message', testContactRequest.message);
    });

    it('should return 400 if name is not provided', async () => {
      const response = await request(app).post('/api/contact').send({ email: 'test@test.com', message: 'test message' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name is required');
    });

    it('should return 400 if email is not provided', async () => {
      const response = await request(app).post('/api/contact').send({ name: 'John Doe', message: 'test message' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email is required');
    });

    it('should return 400 if message is not provided', async () => {
      const response = await request(app).post('/api/contact').send({ name: 'John Doe', email: 'john.doe@example.com' });
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Message is required');
    });
  });
});