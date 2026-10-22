const http = require('http');

const requestLogger = (req, res, next) => {
  res.on('finish', () => {
    // 1. Ambil IP client (support proxy & IPv6 format)
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    if (typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    if (typeof ip === 'string' && ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    } else if (ip === '::1') {
      ip = '127.0.0.1';
    }

    // 2. Ambil port client
    const port = req.socket.remotePort || '';
    const client = port ? `${ip}:${port}` : ip;

    // 3. Request Line (METHOD, URL, HTTP Version)
    const method = req.method;
    const url = req.originalUrl || req.url;
    const httpVersion = `HTTP/${req.httpVersion}`;

    // 4. Status Code & Status Text (e.g., 200 OK, 404 Not Found)
    const statusCode = res.statusCode;
    const statusText = http.STATUS_CODES[statusCode] || res.statusMessage || '';

    // 5. Warna ANSI Terminal
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    const statusColor =
      statusCode >= 500
        ? '\x1b[31m' // Merah untuk 5xx
        : statusCode >= 400
        ? '\x1b[33m' // Kuning untuk 4xx
        : statusCode >= 300
        ? '\x1b[36m' // Cyan untuk 3xx
        : '\x1b[32m'; // Hijau untuk 2xx

    // Format: "INFO:     <client> - "<method> <url> <version>" <status>"
    console.log(
      `${green}INFO:${reset}     ${client} - "${method} ${url} ${httpVersion}" ${statusColor}${statusCode} ${statusText}${reset}`
    );
  });

  next();
};

module.exports = requestLogger;

