const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = process.env.PORT || 3000;

// { "test": { name: "Test", age: "1" } }
const users = {};

// 404 response body
const notFoundBody = {
  message: 'The page you are looking for was not found.',
  id: 'notFound',
};

// Reusable function for sending JSON responses
// Note to self workflow for sending JSON responses:
// 1. The server decides the status code and response data.
// 2. This function converts the data into JSON text.
// 3. It sends the status code and headers.
// 4. It sends the JSON body unless this is a HEAD request.
const sendJSON = (req, res, status, body) => {
    const isHead = req.method === 'HEAD';
    const payload = body !== undefined ? JSON.stringify(body) : '';

    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
    });

    // HEAD requests don't send a body
    if (isHead) {
        res.end();
    } 
    else {
        res.end(payload);
    }
};

// Send a 204 No Content response
const sendNoContent = (req, res) => {
    res.writeHead(204);
    res.end();
};

// Handle GET and HEAD requests to /getUsers.
const handleGetUsers = (req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return sendJSON(req, res, 404, notFoundBody);
    }
    sendJSON(req, res, 200, { users });
};

// 404 handles urls that dont exist
const handleNotFound = (req, res) => {
    sendJSON(req, res, 404, notFoundBody);
};

// Handle POST requests to /addUser.
// Note to self workflow for adding a user:
// 1. Make sure the request is POST.
// 2. Read the data sent in the request body.
// 3. Convert the JSON body into a JavaScript object.
// 4. Check that name and age were provided.
// 5. Check whether the user already exists.
// 6. Update an existing user or create a new user.
// 7. Send the appropriate status code back to the client.
const handleAddUser = (req, res) => {
    if (req.method !== 'POST') {
        return sendJSON(req, res, 404, notFoundBody);
    }

    let rawBody = '';
    req.on('data', (chunk) => { rawBody += chunk; });
    req.on('end', () => {
        let parsed = {};
        try {
            parsed = rawBody ? JSON.parse(rawBody) : {};
        } 
        catch {
            return sendJSON(req, res, 400, {
                message: 'Name and age are both required.',
                id: 'addUserMissingParams',
            });
        }

        const name = parsed.name;
        const age = parsed.age;

        if (!name || !age) {
            return sendJSON(req, res, 400, {
                message: 'Name and age are both required.',
                id: 'addUserMissingParams',
            });
        }

        const key = String(name).toLowerCase();
        const existing = users[key];

        if (existing) {
            existing.age = String(age);
            return sendNoContent(req, res);
        }

        users[key] = { name: String(name), age: String(age) };
        return sendJSON(req, res, 201, { message: 'Created Successfully' });
    });
};

// Read a file from the computer and send it to the browser.
// Note to self workflow for reading computer files to send to the browser:
// 1. Find the requested file.
// 2. Read the file.
// 3. If it cannot be found, send 404.
// 4. If it is found, send 200 and the file contents.
const serveFile = (res, filePath, contentType) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
};


// Create the HTTP server, every time a browser sends a request, this function runs.
// Note to self workflow for the server:
// 1. Figure out what URL was requested.
// 2. Check whether the client wants an HTML/CSS file.
// 3. Otherwise, find the API route.
// 4. Send the request to the correct handler.
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    console.log(`${req.method} ${pathname}`);

    if (pathname === '/' || pathname === '/client.html') {
        return serveFile(res, path.join(__dirname, '..', 'client', 'client.html'), 'text/html');
    }
    if (pathname === '/style.css') {
        return serveFile(res, path.join(__dirname, '..', 'client', 'style.css'), 'text/css');
    }

    switch (pathname) {
        case '/getUsers': return handleGetUsers(req, res);
        case '/addUser': return handleAddUser(req, res);
        case '/notReal': return handleNotFound(req, res);
        default: return handleNotFound(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});