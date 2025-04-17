import request from 'supertest';
import { app } from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Service Routes', () => {
  // Test data
  const testService = {
    title: 'Test Service',
    description: 'This is a test service',
    price: 99.99,
  };

  describe('POST /api/services', () => {
    it('should create a new service', async () => {
      const response = await request(app)
        .post('/api/services')
        .send(testService)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(testService.title);
      expect(response.body.description).toBe(testService.description);
      expect(response.body.price).toBe(testService.price);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/services')
        .send({ title: 'Incomplete Service' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/services', () => {
    it('should return all services', async () => {
      // First create a service
      await prisma.service.create({
        data: testService,
      });

      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return a specific service', async () => {
      // First create a service
      const createdService = await prisma.service.create({
        data: testService,
      });

      const response = await request(app)
        .get(`/api/services/${createdService.id}`)
        .expect(200);

      expect(response.body.id).toBe(createdService.id);
      expect(response.body.title).toBe(testService.title);
    });

    it('should return 404 if service not found', async () => {
      const response = await request(app)
        .get('/api/services/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update a service', async () => {
      // First create a service
      const createdService = await prisma.service.create({
        data: testService,
      });

      const updatedData = {
        title: 'Updated Service',
        description: 'This is an updated service',
        price: 149.99,
      };

      const response = await request(app)
        .put(`/api/services/${createdService.id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.price).toBe(updatedData.price);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete a service', async () => {
      // First create a service
      const createdService = await prisma.service.create({
        data: testService,
      });

      await request(app)
        .delete(`/api/services/${createdService.id}`)
        .expect(204);

      // Verify the service is deleted
      const deletedService = await prisma.service.findUnique({
        where: { id: createdService.id },
      });

      expect(deletedService).toBeNull();
    });
  });
}); 