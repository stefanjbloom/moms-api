import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all blog posts
router.get('/', async (req, res) => {
  try {
    const blogPosts = await prisma.blogPost.findMany();
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// Create a new blog post
router.post('/', async (req, res) => {
  try {
    const blogPost = await prisma.blogPost.create({
      data: req.body
    });
    res.status(201).json(blogPost);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

export default router; 