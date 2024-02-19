const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const crypto = require('crypto');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const messages = [];

wss.on('connection', (ws) => {
    // Envie as mensagens existentes para o novo cliente ao se conectar
    messages.forEach((message) => ws.send(JSON.stringify(message)));

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        messages.push(message);

        // Envie a nova mensagem para todos os clientes conectados
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    });
});

server.listen(8080, () => {
    console.log('Server listening on http://localhost:8080');
});
