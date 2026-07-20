import { Router } from 'express';
import * as blogService from '../services/blog.service';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const blogs = await blogService.getAllBlogPosts();
    return res.json(blogs);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid blog ID format' });
    }
    const blog = await blogService.getBlogPostById(id);
    if (!blog) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    return res.json(blog);
  } catch (error) {
    next(error);
  }
});

export default router;
