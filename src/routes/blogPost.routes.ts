import express, { Request, Response, Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const blogPostRouter: Router = express.Router();
const prisma = new PrismaClient();

// Get all blog posts
blogPostRouter.get('/', async (req: Request, res: Response) => {
  try {
    const blogPosts = await prisma.blogPost.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Get a single blog post by ID
blogPostRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blogPost = await prisma.blogPost.findUnique({
      where: { id }
    });
    
    if (!blogPost) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    
    res.json(blogPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// Create a new blog post
blogPostRouter.post('/', async (req: Request, res: Response) => {
  try {
    const blogPost = await prisma.blogPost.create({
      data: req.body
    });
    res.status(201).json(blogPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// Update a blog post
blogPostRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: req.body
    });
    res.json(blogPost);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

export default blogPostRouter; 