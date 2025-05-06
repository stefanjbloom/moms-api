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

describe('Client Validation', () => {
  const validData = {
    name: 'John Doe',
    aboutMe: 'A professional with extensive experience in the field.',
    email: 'john@example.com'
  };

  let clientId: string;

  beforeEach(async () => {
    // Create a client first
    const client = await prisma.client.create({
      data: validData
    });
    clientId = client.id;
  });

  describe('PUT /api/client', () => {
    it('should accept valid client data', async () => {
      const response = await request(app)
        .put('/api/client')
        .send(validData)
        .expect(200);

      expect(response.body).toHaveProperty('name', validData.name);
      expect(response.body).toHaveProperty('aboutMe', validData.aboutMe);
      expect(response.body).toHaveProperty('email', validData.email);
    });

    it('should reject invalid name', async () => {
      const response = await request(app)
        .put('/api/client')
        .send({ ...validData, name: 'J' })
        .expect(400);

      expect(response.body.error).toContain('Name must be at least 2 characters long');
    });

    it('should reject invalid aboutMe', async () => {
      const response = await request(app)
        .put('/api/client')
        .send({ ...validData, aboutMe: 'Too short' })
        .expect(400);

      expect(response.body.error).toContain('About Me must be at least 10 characters long');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .put('/api/client')
        .send({ ...validData, email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toContain('Email must be in a valid format');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .put('/api/client')
        .send({ name: 'John Doe' })
        .expect(400);

      expect(response.body.error).toContain('About Me is required');
      expect(response.body.error).toContain('Email is required');
    });

    it('should reject empty strings', async () => {
      const response = await request(app)
        .put('/api/client')
        .send({
          name: '',
          aboutMe: '',
          email: ''
        })
        .expect(400);

      expect(response.body.error).toContain('Name is required');
      expect(response.body.error).toContain('About Me is required');
      expect(response.body.error).toContain('Email is required');
    });

    it('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',           // No @ symbol
        'test@',                   // No domain
        '@example.com',           // No username
        'test@example',           // No TLD
        'test@example.invalid',   // Invalid TLD
        'test@.com',             // No domain name
        'test@example..com',     // Double dots
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .put('/api/client')
          .send({ ...validData, email })
          .expect(400);

        expect(response.body.error).toContain('Email must be in a valid format');
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user@domain.net',
        'name@company.org',
        'student@university.edu',
        'admin@startup.io',
        'contact@business.co'
      ];

      for (const email of validEmails) {
        const response = await request(app)
          .put('/api/client')
          .send({ ...validData, email })
          .expect(200);

        expect(response.body).toHaveProperty('email', email);
      }
    });
  });

  describe('Joi Schema Validation', () => {
    const { clientSchema } = require('../validations/client.validation');

    it('should validate correct data', () => {
      const { error } = clientSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject data with name too long', () => {
      const { error } = clientSchema.validate({
        ...validData,
        name: 'a'.repeat(101)
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Name cannot exceed 100 characters');
    });

    it('should reject data with aboutMe too long', () => {
      const { error } = clientSchema.validate({
        ...validData,
        aboutMe: 'a'.repeat(1001)
      });
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('About Me cannot exceed 1000 characters');
    });
  });
}); 