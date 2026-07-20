import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import helmet from "helmet";
import { setupDatabase } from "./server/db";
import { initScheduler } from "./server/services/scheduler.service";

// Routers
import authRouter from "./server/routes/auth.routes";
import serviceRouter from "./server/routes/service.routes";
import orderRouter from "./server/routes/order.routes";
import adminRouter from "./server/routes/admin.routes";
import invoiceRouter from "./server/routes/invoice.routes";
import complianceRouter from "./server/routes/compliance.routes";
import documentRouter from "./server/routes/document.routes";
import profileRouter from "./server/routes/profile.routes";
import contactRouter from "./server/routes/contact.routes";
import leadsRouter from "./server/routes/leads.routes";
import blogRouter from "./server/routes/blog.routes";
import webhookRoutes from "./server/routes/webhook.routes";
import couponRouter from "./server/routes/coupon.routes";
import { errorHandler } from "./server/middlewares/error.middleware";
import { serviceCategories, generateSlug } from "./src/data/services";
import { getAllBlogPosts } from "./server/services/blog.service";

async function startServer() {
  const app = express();
  app.set('trust proxy', true);
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // --- SEO & Security Headers ---
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled to prevent blocking existing inline scripts/GTM
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: {
      action: "sameorigin" // Sets X-Frame-Options: SAMEORIGIN
    }
  }));

  // Enforce non-WWW canonical domain
  app.use((req, res, next) => {
    const host = req.headers.host || "";
    if (host.startsWith("www.")) {
      const nonWwwHost = host.replace(/^www\./, "");
      return res.redirect(301, `https://${nonWwwHost}${req.originalUrl}`);
    }
    next();
  });

  // 301 Permanent Redirects for Missing Pages
  const redirects: Record<string, string> = {
    "/startup-registrations": "/services/startup",
    "/license": "/services/licenses",
    "/gst": "/services/gst",
    "/startup-registrations/one-person-company-opc-registration": "/services/startup/opc-registration",
    "/license/trade-license": "/services/licenses/trade-license",
    "/gst/gst-registration-for-foreigners": "/services/gst/foreign-company-registration"
  };

  app.use((req, res, next) => {
    const target = redirects[req.path];
    if (target) {
      return res.redirect(301, target);
    }
    
    // Strip trailing slashes for SEO consistency (except root)
    if (req.path.length > 1 && req.path.endsWith('/')) {
      const query = req.url.slice(req.path.length);
      return res.redirect(301, req.path.slice(0, -1) + query);
    }
    
    next();
  });

  // Request logger middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // --- Webhook Routes (Mounted before global body parsers to preserve raw stream) ---
  app.use('/api/webhooks', webhookRoutes);

  // JSON and URL-encoded body parser limits
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- Public API Routes ---
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  // --- Standalone DB Connection Test Route ---
  app.get(["/test", "/test/"], async (_req, res) => {
    try {
      const mysql = await import('mysql2/promise');
      let dbHost = process.env.DB_HOST || 'localhost';
      const dbUser = process.env.DB_USER || 'u149740700_DeccanFilings';
      const dbPassword = process.env.DB_PASSWORD || 'DeccanFilings@2026';
      const dbName = process.env.DB_NAME || 'u149740700_DeccanFilings';
      let dbPort = 3306;

      // Normalize dbHost if it was configured as a URI (e.g. http://127.0.0.1:3306)
      if (dbHost.includes('://')) {
        dbHost = dbHost.split('://')[1];
      }
      if (dbHost.includes(':')) {
        const parts = dbHost.split(':');
        dbHost = parts[0];
        const parsedPort = parseInt(parts[1], 10);
        if (!isNaN(parsedPort)) {
          dbPort = parsedPort;
        }
      }

      const connection = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        connectTimeout: 5000
      });
      const [rows] = await connection.query('SELECT 1 + 1 AS test_result');
      
      let tablesList: string[] = [];
      try {
        const [tables] = await connection.query('SHOW TABLES');
        tablesList = (tables as any[]).map((row: any) => Object.values(row)[0] as string);
      } catch (e: any) {
        tablesList = [`Warning: Could not fetch tables - ${e.message}`];
      }

      await connection.end();

      res.status(200).json({
        status: "success",
        message: "Successfully connected to the database server!",
        config: {
          host: dbHost,
          port: dbPort,
          user: dbUser,
          database: dbName
        },
        queryTest: `SELECT 1+1 returned ${rows[0].test_result}`,
        tables: tablesList
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        message: "Failed to connect to the database!",
        errorMessage: error.message,
        errorCode: error.code || 'N/A',
        syscall: error.syscall || 'N/A'
      });
    }
  });

  // --- Mount API Routers ---
  app.use("/api/auth", authRouter);
  app.use("/api/services", serviceRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/admin/invoices", invoiceRouter);
  app.use("/api/compliance", complianceRouter);
  app.use("/api/documents", documentRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/leads", leadsRouter);
  app.use("/api/blogs", blogRouter);
  app.use("/api/coupons", couponRouter);
  app.use("/api", profileRouter); // Matches: /api/user/*, /api/invoices, /api/stats/*

  // --- Dynamic Sitemap Endpoint ---
  app.get('/sitemap.xml', async (_req, res) => {
    try {
      const baseUrl = 'https://deccanfilings.com';
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // 1. Static Pages
      const staticPages = [
        '', '/about', '/contact', '/blog', '/services',
        '/careers', '/privacy', '/terms', '/refund',
        '/tools/gst-calculator', '/tools/compliance-calendar',
        '/itr-filing', '/itr-filing-b'
      ];

      for (const page of staticPages) {
        xml += `
  <url>
    <loc>${baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
      }

      // 2. Dynamic Service Pages
      for (const category of serviceCategories) {
        for (const service of category.services) {
          const serviceSlug = generateSlug(service);
          xml += `
  <url>
    <loc>${baseUrl}/services/${category.slug}/${serviceSlug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
        }
      }

      // 3. Blog Posts
      try {
        const blogs = await getAllBlogPosts();
        for (const blog of blogs) {
          xml += `
  <url>
    <loc>${baseUrl}/blog/${blog.id}</loc>
    <lastmod>${new Date(blog.created_at || blog.date || Date.now()).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
      } catch (dbErr) {
        console.error('Error fetching blogs for sitemap:', dbErr);
        // Continue without blogs if DB fails, rather than crashing sitemap
      }

      xml += `
</urlset>`;

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (err) {
      console.error('Error generating sitemap:', err);
      res.status(500).end();
    }
  });

  // Serve static files from uploads
  app.use('/uploads', express.static(uploadsDir));

  // --- Vite Dev Server / Static Production SPA Servicing ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // --- Global Error Handler ---
  app.use(errorHandler);

  // --- Start Listening ---
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`============================================================`);
    console.log(` Deccan Filings Backend Server Running on http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`============================================================`);

    // Asynchronously initialize database and run CSV/JSON seeds
    setupDatabase()
      .then(() => {
        console.log("Database initialized & catalog seeded successfully.");
        // Start statutory compliance notification scheduler
        initScheduler();
      })
      .catch(err => {
        console.error("CRITICAL: Database initialization failed:", err);
      });
  });
}

startServer();
