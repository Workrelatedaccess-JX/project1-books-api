// apiHandlers.js handles the API endpoints for the book server, 
// including GET and POST requests for books, authors, genres, and stats.
const { sendJSON, sendNoContent } = require('./responses');
const store = require('./dataStorage');

const notFoundBody = { message: 'Resource not found', id: 'notFound' };
const badRequestBody = (msg) => ({ message: msg, id: 'badRequest' });

// GET /api/books 
const handleGetBooks = (req, res, query) => {
    const filtered = store.getAllBooks({
        author: query.get('author'),
        country: query.get('country'),
        year: query.get('year'),
        limit: query.get('limit'),
    });
    sendJSON(req, res, 200, { count: filtered.length, books: filtered });
};

// GET /api/books/:title 
const handleGetBookByTitle = (req, res, title) => {
    const book = store.getBookByTitle(decodeURIComponent(title));
    if (!book) return sendJSON(req, res, 404, notFoundBody);
    sendJSON(req, res, 200, book);
};

// GET /api/authors 
const handleGetAuthors = (req, res, query) => {
    let authors = store.getAllAuthors();
    if (query.get('limit')) authors = authors.slice(0, Number(query.get('limit')));
    sendJSON(req, res, 200, { count: authors.length, authors });
};

// GET /api/genres 
const handleGetGenres = (req, res) => {
    const genres = store.getAllGenres();
    sendJSON(req, res, 200, { count: genres.length, genres });
};

// GET /api/stats 
const handleGetStats = (req, res) => {
    sendJSON(req, res, 200, store.getStats());
};

// POST /api/addBook 
const handleAddBook = (req, res) => {
    parseBody(req, (err, body) => {
        if (err) {
            console.log('parseBody error:', err);
            return sendJSON(req, res, 400, badRequestBody('Invalid body'));
        }

        const { title, author, country, language, pages, year } = body;
        if (!title || !author) {
            return sendJSON(req, res, 400, badRequestBody('title and author are required'));
        }

        const { book, created } = store.addBook({
            title, author, country, language,
            pages: Number(pages), year: Number(year),
        });

        if (created) return sendJSON(req, res, 201, { message: 'Book added', book });

        // Book already exists then 204 No Content
        return sendNoContent(req, res);
    });
};

// POST /api/rateBook 
const handleRateBook = (req, res) => {
    parseBody(req, (err, body) => {
        if (err) return sendJSON(req, res, 400, badRequestBody('Invalid body'));

        const { title, rating } = body;
        if (!title || rating === undefined) {
        return sendJSON(req, res, 400, badRequestBody('title and rating are required'));
        }

        const updated = store.rateBook(title, rating);
        if (!updated) return sendJSON(req, res, 404, notFoundBody);
        sendJSON(req, res, 200, { message: 'Rating updated', book: updated });
    });
};

// Reads the request body and parses it as JSON or urlencoded, depending on the Content-Type header.
const parseBody = (req, callback) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
        console.log('RAW BODY:', raw);
        const contentType = (req.headers['content-type'] || '').toLowerCase();

        try {
            if (contentType.includes('application/json')) {
                callback(null, raw ? JSON.parse(raw) : {});
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                const params = new URLSearchParams(raw);
                callback(null, Object.fromEntries(params));
            } else {
                callback(new Error('Unsupported content type'), null);
            }
        } 
        catch (err) {
            callback(err, null);
        }
    });
};

module.exports = {
    handleGetBooks, handleGetBookByTitle, handleGetAuthors,
    handleGetGenres, handleGetStats, handleAddBook, handleRateBook,
};