// app.js - Configures the Express application instance.

import express from 'express';
import gameRoutes from './route.js';
import path from 'path';

const app = express();

// Middleware
app.use(express.json()); // Body parser for application/json

// Serve static files (the HTML client)
// In a real project, we would use path.join(__dirname, 'public')
app.use(express.static('public'));

// API Routes
app.use('/api/v1/game', gameRoutes);

// Simple health check route
app.get('/health', (req, res) => {
    res.status(200).send('API is running.');
});

// Error handling middleware (catch-all)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;
