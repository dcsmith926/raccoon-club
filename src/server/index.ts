import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import {
    ActionType,
    DrawPointAction,
    DrawLineAction,
    DrawPathAction,
    MouseMoveAction,
} from '../common/actions';
import { retrieveUsername, returnUsername } from './usernames';

const PORT = 8002;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', socket => {
    
    console.log('user connected');

    const username = retrieveUsername();

    console.log(`assigning username: ${username}`);
    socket.emit(ActionType.ASSIGN_USERNAME, {
        type: ActionType.ASSIGN_USERNAME,
        payload: {
            username,
        },
    });

    socket.on(ActionType.DRAW_POINT, (action: DrawPointAction) => {
        socket.broadcast.emit(ActionType.DRAW_POINT, action);
    });

    socket.on(ActionType.DRAW_LINE, (action: DrawLineAction) => {
        socket.broadcast.emit(ActionType.DRAW_LINE, action);
    });

    socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {
        socket.broadcast.emit(ActionType.DRAW_PATH, action);
    });

    socket.on(ActionType.MOUSE_MOVE, (action: MouseMoveAction) => {
        socket.broadcast.emit(ActionType.MOUSE_MOVE, action);
    });

    socket.on('disconnect', () => {
        console.log(`User: ${username} disconnected`);
        returnUsername(username);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});