# Deccan Filings Dashboard

This is a full-stack web application built with React, Vite, Express, and SQLite. It features a modern SaaS dashboard with a fully functional SQL backend.

## Tech Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Framer Motion, Lucide React
*   **Backend**: Node.js, Express
*   **Database**: MySQL

## Prerequisites

Make sure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   npm (comes with Node.js)

## Getting Started

Follow these instructions to get the project up and running on your local machine.

### 1. Install Dependencies

Open your terminal, navigate to the project directory, and run:

```bash
npm install
```

### 2. Run the Development Server

To start the full-stack development server (which runs both the Express backend and the Vite frontend middleware), run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

*Note: The SQLite database (`database.sqlite`) will be automatically created and seeded with initial data the first time you run the server.*

### 3. Build for Production

To build the application for production, run:

```bash
npm run build
```

This will compile the React frontend into static files in the `dist` directory.

### 4. Run in Production Mode

After building the frontend, you can start the production server:

```bash
npm run start
```

The production server will serve the static files from the `dist` directory and handle API requests on `http://localhost:3000`.

## Project Structure

*   `/src`: Contains the React frontend code (components, pages, styles).
*   `/server`: Contains the backend database configuration and setup (`db.ts`).
*   `server.ts`: The main Express server entry point that handles API routes and serves the frontend.
*   `database.sqlite`: The SQLite database file (generated automatically on first run).
