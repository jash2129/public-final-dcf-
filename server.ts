import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
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
import webhookRoutes from "./server/routes/webhook.routes";
import { errorHandler } from "./server/middlewares/error.middleware";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

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
  app.use("/api", profileRouter); // Matches: /api/user/*, /api/invoices, /api/stats/*

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
