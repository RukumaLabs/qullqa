import { startHttpServer } from './http-server.js';
import { storageInstance } from './storage.js';

// Initialize storage
await storageInstance.init();

// Start server
startHttpServer(1337);

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('HTTP server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('HTTP server shutting down...');
  process.exit(0);
});