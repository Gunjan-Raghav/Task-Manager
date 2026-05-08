const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the built frontend before API routes (as suggested by Railway PR)
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/alive', (req, res) => res.json({ status: 'Backend is running!' }));

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// SPA fallback - serve index.html for any route not matched by the API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 4000;
// Global Error Handler
app.use((err, req, res, next) => {
  console.error('--- SERVER CRASH DETECTED ---');
  console.error('Error Path:', req.path);
  console.error('Error Stack:', err.stack);
  console.error('-----------------------------');
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
