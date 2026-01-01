#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// Configuration
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('========================================');
console.log('🚀 Fuzzie Workflow Automation');
console.log('========================================');
console.log('Starting server...');
console.log(`Port: ${PORT}`);
console.log(`Host: ${HOST}`);
console.log('========================================\n');

// Start the Next.js standalone server
const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');

// Check if we're running from packaged exe or normal node
const isPackaged = process.pkg !== undefined;

if (isPackaged) {
  console.log('Running in packaged mode (.exe)');
} else {
  console.log('Running in development mode');
}

// Start the server
const startServer = () => {
  try {
    // Import and start the Next.js server
    const NextServer = require('./.next/standalone/server.js');
    
    console.log('✅ Server started successfully!');
    console.log('\n========================================');
    console.log(`🌐 Local:    http://localhost:${PORT}`);
    console.log(`🌐 Network:  http://${HOST}:${PORT}`);
    console.log('========================================\n');
    console.log('📝 Press Ctrl+C to stop the server\n');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('\nMake sure you have run "npm run build" first!');
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n========================================');
  console.log('🛑 Shutting down server...');
  console.log('========================================');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n========================================');
  console.log('🛑 Shutting down server...');
  console.log('========================================');
  process.exit(0);
});

// Start the server
startServer();
