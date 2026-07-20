import { pool } from '../db';
import mysql from 'mysql2/promise';

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
  created_at: string;
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT * FROM blog_posts ORDER BY id DESC'
    );
    return rows as BlogPost[];
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    throw new Error('Failed to fetch blog posts from database');
  }
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  try {
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT * FROM blog_posts WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      return null;
    }
    return rows[0] as BlogPost;
  } catch (error) {
    console.error(`Error fetching blog post ${id}:`, error);
    throw new Error('Failed to fetch blog post from database');
  }
}
