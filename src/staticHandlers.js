// StaticHandlers.js act as a static file server for the client files (HTML, CSS, etc.).
const path = require('node:path');
const { serveFile } = require('./responses');

const CLIENT_DIR = path.join(__dirname, '..', 'client');

// looks up a URL path in a map and calls serveFile with the matching file and content type.
const serveStatic = (res, pathname) => {
    const staticMap = {
        '/':             ['client.html', 'text/html'],
        '/client.html':  ['client.html', 'text/html'],
        '/docs.html':    ['docs.html',   'text/html'],
        '/style.css':    ['style.css',   'text/css'],
    };

    const entry = staticMap[pathname];

    // not a static file then let server.js continue
    if (!entry) return false;

    const [file, contentType] = entry;
    serveFile(res, path.join(CLIENT_DIR, file), contentType);
    return true;
};

module.exports = { serveStatic };