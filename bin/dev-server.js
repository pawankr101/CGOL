const { createReadStream } = require('fs');
const { createServer } = require('http');
const { extname, resolve } = require('path');

const CONFIG = {
    host: 'localhost',
    port: 3000,
    src: resolve(__dirname, '..', 'src'),
    mimeTypes: {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.ico': 'image/x-icon',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
    }
}

function startDevServer() {
    createServer((request, response) => {
        const _path = (request.url==='/'? 'index.html' : (request.url[0]==='/' ? request.url.slice(1) : request.url));
        response.setHeader('content-type', CONFIG.mimeTypes[extname(_path)]||'text/plain' + ';charset=utf-8');
        createReadStream(resolve(CONFIG.src, _path)).on('error', (e) => {
            console.log(e);
            response.setHeader('content-type', CONFIG.mimeTypes['.json']);
            response.statusCode = 404;
            response.end();
        }).pipe(response);
    }).on('error', console.error).listen(CONFIG.port, CONFIG.host, () => {
        console.log(`\x1b[32mServer Started\x1b[0m`);
        console.log(`URL: \x1b[34mhttp://${CONFIG.host}:${CONFIG.port}\x1b[0m`)
    });
}
startDevServer();
