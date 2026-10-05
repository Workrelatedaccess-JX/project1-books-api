// The server uses the rest of the modules to handle requests and responses, including static files and API endpoints.
const http = require('node:http');
const { sendJSON } = require('./responses');
const { serveStatic } = require('./staticHandlers');
const api = require('./apiHandlers');

const PORT = process.env.PORT || 3000;

// Create the HTTP server and handle requests.
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;
    const query = url.searchParams;

    console.log(`${req.method} ${pathname}`);

    const isRead = req.method === 'GET' || req.method === 'HEAD';

    // Static files
    // If serveStatic returns true, it has already sent the response.
    if (serveStatic(res, pathname)) return;

    // GET / HEAD routes
    if (pathname === '/api/books' && isRead) return api.handleGetBooks(req, res, query);
    if (pathname === '/api/authors' && isRead) return api.handleGetAuthors(req, res, query);
    if (pathname === '/api/genres' && isRead) return api.handleGetGenres(req, res);
    if (pathname === '/api/stats' && isRead) return api.handleGetStats(req, res);

    if (pathname.startsWith('/api/books/') && isRead) {
        const title = pathname.replace('/api/books/', '');
        return api.handleGetBookByTitle(req, res, title);
    }

    // POST routes
    if (pathname === '/api/addBook' && req.method === 'POST') return api.handleAddBook(req, res);
    if (pathname === '/api/rateBook' && req.method === 'POST') return api.handleRateBook(req, res);

    // 404
    return sendJSON(req, res, 404, {
        message: 'The page you are looking for was not found.',
        id: 'notFound',
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});