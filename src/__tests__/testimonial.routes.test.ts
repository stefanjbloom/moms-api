import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import testimonialRouter from '../routes/testimonial.routes';
import { adminAuth } from '../middleware/auth';
import { testServer } from './server';


// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    testimonial: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

// Mock adminAuth middleware
jest.mock('../middleware/auth', () => ({
  adminAuth: jest.fn((req, res, next) => next()),
}));

describe('Testimonial Routes', () => {
  let app: express.Application;
  const prisma = new PrismaClient();

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/testimonials', testimonialRouter);
    jest.clearAllMocks();
  });

  describe('GET /testimonials', () => {
    it('should return all testimonials', async () => {
      const mockTestimonials = [
        { 
          id: '1', 
          name: 'John Doe', 
          content: 'Great service!', 
          rating: 5,
          createdAt: new Date() 
        },
        { 
          id: '2', 
          name: 'Jane Smith', 
          content: 'Excellent experience', 
          rating: 5,
          createdAt: new Date() 
        },
      ];

      (prisma.testimonial.findMany as jest.Mock).mockResolvedValue(mockTestimonials);

      const response = await request(app).get('/testimonials');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTestimonials);
      expect(prisma.testimonial.findMany).toHaveBeenCalled();
    });

    it('should handle errors when fetching testimonials', async () => {
      (prisma.testimonial.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/testimonials');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch testimonials' });
    });
  });

  describe('POST /testimonials', () => {
    it('should create a new testimonial', async () => {
      const newTestimonial = {
        name: 'John Doe',
        content: 'Great service!',
        rating: 5
      };

      const createdTestimonial = {
        id: '1',
        ...newTestimonial,
        createdAt: new Date()
      };

      (prisma.testimonial.create as jest.Mock).mockResolvedValue(createdTestimonial);

      const response = await request(app)
        .post('/testimonials')
        .send(newTestimonial);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdTestimonial);
      expect(prisma.testimonial.create).toHaveBeenCalledWith({
        data: newTestimonial
      });
    });

    it('should handle errors when creating testimonial', async () => {
      (prisma.testimonial.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/testimonials')
        .send({
          name: 'John Doe',
          content: 'Great service!',
          rating: 5
        });
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to create testimonial' });
    });
  });
}); 