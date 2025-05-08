import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';
import { resetAllLimiters } from '../middleware/rateLimit';
import '../__tests__/setup';

const prisma = new PrismaClient();

// Ensure ADMIN_KEY is set for tests
if (!process.env.ADMIN_KEY) {
  process.env.ADMIN_KEY = 'test-admin-key';
}

describe('Security Measures', () => {
  beforeEach(async () => {
    // Reset rate limiters before each test
    await resetAllLimiters();
  });

  // Test data
  const testService = {
    title: 'Test Service',
    description: 'This is a test service description that meets the minimum length requirement',
    price: 99.99,
    clientId: 'test-client-id'
  };

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('x-admin-key', process.env.ADMIN_KEY || '')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should block requests exceeding rate limit', async () => {
      // Make multiple requests quickly in sequence
      for (let i = 0; i < 15; i++) {
        await request(app)
          .get('/api/services')
          .set('x-admin-key', process.env.ADMIN_KEY || '');
      }

      // This request should be blocked
      const response = await request(app)
        .get('/api/services')
        .set('x-admin-key', process.env.ADMIN_KEY || '');

      expect(response.status).toBe(429);
      expect(response.body.error).toBe('Too many requests, please try again later.');
    });
  });

  describe('CORS', () => {
    it('should allow requests from allowed origins', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('Origin', 'http://localhost:3000')
        .set('x-admin-key', process.env.ADMIN_KEY || '')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    it('should block requests from disallowed origins', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('Origin', 'http://malicious-site.com')
        .set('x-admin-key', process.env.ADMIN_KEY || '')
        .expect(200); // CORS is handled by browser, so server still responds

      expect(response.headers['access-control-allow-origin']).not.toBe('http://malicious-site.com');
    });
  });

  describe('XSS Protection', () => {
    let clientId: string;

    beforeEach(async () => {
      // Create a test client
      const client = await prisma.client.create({
        data: {
          name: 'Test Client',
          email: 'test@example.com',
          aboutMe: 'Test about me'
        }
      });
      clientId = client.id;
    });

    it('should sanitize XSS attempts in request body', async () => {
      const xssPayload = {
        title: '<script>alert("xss")</script>Test Service',
        description: 'This is a test service description that meets the minimum length requirement',
        price: 99.99,
        clientId
      };

      const response = await request(app)
        .post('/api/services')
        .set('x-admin-key', process.env.ADMIN_KEY || '')
        .send(xssPayload)
        .expect(201);

      expect(response.body.title).not.toContain('<script>');
    });
  });

  describe('Admin Authentication', () => {
    it('should allow access with valid admin key', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('x-admin-key', process.env.ADMIN_KEY || '')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should block access without admin key', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should block access with invalid admin key', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('x-admin-key', 'invalid-key')
        .expect(401);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('Public vs Protected Routes', () => {
    it('should allow public access to appointments', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .expect(200);

      expect(response.status).toBe(200);
    });

    it('should require admin key for protected routes', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(401);

      expect(response.status).toBe(401);
    });
  });

  describe('Input Validation', () => {
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('x-admin-key', process.env.ADMIN_KEY || '')
        .send({ title: 'Incomplete Service' })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should validate field formats', async () => {
      const response = await request(app)
        .post('/api/services')
        .set('x-admin-key', process.env.ADMIN_KEY || '')
        .send({
          title: 'Te', // Too short
          description: 'Short', // Too short
          price: -100, // Negative price
          clientId: 'invalid-uuid'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should not expose internal errors in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.error).toBe('Resource not found');
      
      process.env.NODE_ENV = originalEnv;
    });
  });
}); 