import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import blogPostRouter from '../routes/blogPost.routes';
import { adminAuth } from '../middleware/auth';
import { testServer } from './server';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    blogPost: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  })),
}));

// Mock adminAuth middleware
jest.mock('../middleware/auth', () => ({
  adminAuth: jest.fn((req, res, next) => next()),
}));

describe('Blog Post Routes', () => {
  let app: express.Application;
  const prisma = new PrismaClient();
  const mockDate = new Date('2024-05-08T19:05:39.861Z');

  beforeAll(async () => {
    await testServer.start();
  });

  afterAll(async () => {
    await testServer.stop();
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/blog', blogPostRouter);
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('GET /blog', () => {
    it('should return all blog posts', async () => {
      const mockBlogPosts = [
        { 
          id: '1', 
          title: 'Test Post 1', 
          content: 'Content 1', 
          createdAt: mockDate,
          clientId: null
        },
        { 
          id: '2', 
          title: 'Test Post 2', 
          content: 'Content 2', 
          createdAt: mockDate,
          clientId: null
        },
      ];

      (prisma.blogPost.findMany as jest.Mock).mockResolvedValue(mockBlogPosts);

      const response = await request(app).get('/blog');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBlogPosts);
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      });
    });

    it('should handle errors when fetching blog posts', async () => {
      (prisma.blogPost.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/blog');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch blog posts' });
    });
  });

  describe('GET /blog/:id', () => {
    it('should return a single blog post', async () => {
      const mockBlogPost = {
        id: '1',
        title: 'Test Post',
        content: 'Test Content',
        createdAt: mockDate,
        clientId: null
      };

      (prisma.blogPost.findUnique as jest.Mock).mockResolvedValue(mockBlogPost);

      const response = await request(app).get('/blog/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBlogPost);
      expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });

    it('should return 404 when blog post is not found', async () => {
      (prisma.blogPost.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/blog/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Blog post not found' });
    });
  });

  describe('POST /blog', () => {
    it('should create a new blog post', async () => {
      const newBlogPost = {
        title: 'New Post',
        content: 'New Content'
      };

      const createdBlogPost = {
        id: 'a9d2ad27-c1b1-4fb9-a054-e579ff65e40e',
        ...newBlogPost,
        createdAt: mockDate,
        clientId: null
      };

      (prisma.blogPost.create as jest.Mock).mockResolvedValue(createdBlogPost);

      const response = await request(app)
        .post('/blog')
        .send(newBlogPost);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdBlogPost);
      expect(prisma.blogPost.create).toHaveBeenCalledWith({
        data: newBlogPost
      });
    });
  });

  describe('PUT /blog/:id', () => {
    it('should update an existing blog post', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated Content'
      };

      const updatedBlogPost = {
        id: '1',
        ...updateData,
        createdAt: mockDate,
        clientId: null
      };

      (prisma.blogPost.update as jest.Mock).mockResolvedValue(updatedBlogPost);

      const response = await request(app)
        .put('/blog/1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedBlogPost);
      expect(prisma.blogPost.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateData
      });
    });

    it('should return 404 when updating non-existent blog post', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';
      
      (prisma.blogPost.update as jest.Mock).mockRejectedValue(error);

      const response = await request(app)
        .put('/blog/999')
        .send({ title: 'Updated Title' });
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Blog post not found' });
    });
  });
});