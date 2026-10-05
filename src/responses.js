// responses.js act as a utility module for sending JSON responses and serving static files.
const fs = require('node:fs');

// Send a JSON response or empty body for HEAD.
const sendJSON = (req, res, status, body) => {
    const isHead = req.method === 'HEAD';
    const payload = body !== undefined ? JSON.stringify(body) : '';

    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
    });

    res.end(isHead ? undefined : payload);
};

// Send a 204 No Content response.
const sendNoContent = (req, res) => {
    res.writeHead(204, { 'Content-Length': 0 });
    res.end();
};

// reads a file from disk and sends it with the correct content type and length.
const serveFile = (res, filePath, contentType) => {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('File not found');
            return;
        }
        // Set the appropriate headers and send the file content
        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': data.length,
        });
        res.end(data);
    });
};

module.exports = { sendJSON, sendNoContent, serveFile };