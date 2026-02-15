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
  '.gltf': 'model/gltf+json',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.heic': 'image/heic'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return mimeTypes[ext] || 'application/octet-stream';
}

// Tipos que deben servirse con streaming (Range Requests)
const streamTypes = new Set(['.mp4', '.webm', '.ogg', '.mov', '.avi']);

function isStreamable(filePath) {
  return streamTypes.has(path.extname(filePath).toLowerCase());
}

function serveWithRange(req, res, filePath, stat) {
  const mimeType = getMimeType(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  // Common headers for all video responses
  const commonHeaders = {
    'Accept-Ranges': 'bytes',
    'Content-Type': mimeType,
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache',
  };

  if (range) {
    // Parse Range header: "bytes=start-end"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 1024 * 1024 - 1, fileSize - 1); // max 1MB chunks
    
    // Validate range
    if (start >= fileSize || end >= fileSize || start > end) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`,
      });
      res.end();
      return;
    }

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      ...commonHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': chunkSize,
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath, { start, end });
    stream.on('error', () => { res.end(); });
    stream.pipe(res);
  } else {
    // No range requested — send full file info with Accept-Ranges header
    res.writeHead(200, {
      ...commonHeaders,
      'Content-Length': fileSize,
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => { res.end(); });
    stream.pipe(res);
  }
}

function serveStaticFile(req, res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>404 - File Not Found</h1>
            <p>The requested file was not found.</p>
            <p><a href="/">← Back to home</a></p>
          </body>
        </html>
      `);
      return;
    }

    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      serveStaticFile(req, res, indexPath);
      return;
    }

    // Use streaming for video files (supports seeking / Range Requests)
    if (isStreamable(filePath)) {
      serveWithRange(req, res, filePath, stat);
      return;
    }

    // Regular files
    const mimeType = getMimeType(filePath);
    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => { res.end(); });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(urlObj.pathname);
  
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
      serveStaticFile(req, res, normalizedPath);
      return;
    }
    
    if (stats.isDirectory()) {
      // Try to serve index.html from directory
      const indexPath = path.join(normalizedPath, 'index.html');
      serveStaticFile(req, res, indexPath);
    } else {
      serveStaticFile(req, res, normalizedPath);
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