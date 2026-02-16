// Simple test to verify HTTP server works
const http = require('http');

const PORT = process.env.PORT || 8080;
console.log('Starting HTTP server on port', PORT);

const server = http.createServer((req, res) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

server.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start HTTP server:', err);
    process.exit(1);
  }
  console.log(`✅ HTTP server listening on 0.0.0.0:${PORT}`);
  console.log(`Test by visiting: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  console.error('HTTP server error:', err);
  process.exit(1);
});

// Keep alive
setInterval(() => {
  console.log('Server still running...');
}, 5000);
