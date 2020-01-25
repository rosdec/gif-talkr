const http = new require('http');
const fs = new require('fs');
const path = new require('path');
const ws = new require('ws');

const wss = new ws.Server({ noServer: true });
const clients = new Set();

const messages = [
    "Ciao a tutti!",
    "Benvenuti",
    "Come va?",
    "Ciao bello"
];

var intervalHandler;
const messageInterval = 5000;

const hostname = 'localhost'
const port = 8080

function requestListener(request, response) {
    console.log('request starting...');

    if (request.url == '/ws' && request.headers.upgrade &&
        request.headers.upgrade.toLowerCase() == 'websocket' &&
        request.headers.connection.match(/\bupgrade\b/i)) {
        wss.handleUpgrade(request, request.socket, Buffer.alloc(0), onSocketConnect);
    } else {

        var filePath = '.' + request.url;
        if (filePath == './')
            filePath = './index.html';

        var extname = path.extname(filePath);
        var contentType = 'text/html';
        switch (extname) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }

        fs.readFile(filePath, function (error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    fs.readFile('./404.html', function (error, content) {
                        response.writeHead(200, { 'Content-Type': contentType });
                        response.end(content, 'utf-8');
                    });
                }
                else {
                    response.writeHead(500);
                    response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                    response.end();
                }
            }
            else {
                response.writeHead(200, { 'Content-Type': contentType });
                response.end(content, 'utf-8');
            }
        });
    }
}

function onSocketConnect(ws) {
    clients.add(ws);
    console.log(`websocket new connection`);

    if (clients.size == 1) {
        intervalHandler = setInterval(() => {
            var message = messages[Math.floor(Math.random() * messages.length)];

            for (let client of clients) {
                client.send(message);
                console.log(message);
            }
        }, messageInterval);
    }

    ws.on('close', function () {
        console.log("websocket connection closed");
        clients.delete(ws);

        if (clients.size == 0)
            clearInterval(intervalHandler);
    });
}

http.createServer(requestListener).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})