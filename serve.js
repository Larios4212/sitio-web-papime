const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve('./project/dist');

// MIME types básicos
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file <code>${filePath}</code> was not found.</p>
            <p><a href="/">← Back to home</a></p>
          </body>
        </html>
      `);
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let pathname = urlObj.pathname;
  
  // Redirect root to index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Construct file path
  let filePath = path.join(DIST_DIR, pathname);
  
  // Security: prevent directory traversal
  const normalizedPath = path.resolve(filePath);
  
  if (!normalizedPath.startsWith(DIST_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1><p>Path not allowed</p>');
    return;
  }
  
  // Check if file exists
  fs.stat(normalizedPath, (err, stats) => {
    if (err) {
      serveStaticFile(res, normalizedPath);
      return;
    }
    
    if (stats.isDirectory()) {
      // Try to serve index.html from directory
      const indexPath = path.join(normalizedPath, 'index.html');
      serveStaticFile(res, indexPath);
    } else {
      serveStaticFile(res, normalizedPath);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${DIST_DIR}`);
  console.log(`\\n💡 Tips:`);
  console.log(`   - Make sure to run 'npm run build' first`);
  console.log(`   - Use 'npm run dev' to build and serve simultaneously`);
  console.log(`   - Press Ctrl+C to stop the server`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});