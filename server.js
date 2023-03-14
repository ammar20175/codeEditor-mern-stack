const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);


//we will map the username to the socket id here.
const userSocketMap = {}

//here we are fetching all the clients that are previouly in the room

function getAllConnectedClients(roomId) {

    //map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        };
    })
}

io.on('connection', (socket) => {

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);


        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {

        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    })

    //for sync the code
    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    })


    //for disconnecting

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id]
            });
        });
    });

    delete userSocketMap[socket.id];
    socket.leave();

});




const PORT = process.env.PORT || 7000;

server.listen(PORT, () => console.log(`listening on Port ${PORT}`));