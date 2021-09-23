import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { ActionType, DrawPathAction, MouseMoveAction } from '../common/actions';
import { usernames } from './usernames';

const PORT = 8002;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const availableNames: Set<string> = new Set();
for (let username of usernames) {
    availableNames.add(username);
}

function randomChoice<T>(choices: Array<T>): T {
    return choices[Math.floor(Math.random() * choices.length)];
}

io.on('connection', socket => {
    
    console.log('user connected');

    // TODO: better handling of this case lol
    if (availableNames.size === 0) {
        console.log('no available usernames');
        throw 'uh-oh';
    }

    // check pennsylvania-racccoon first, so first connection receives it
    let username = 'pennsylvania-raccoon';
    if (!availableNames.has(username)) {
        username = randomChoice([...availableNames.values()]);
    }

    console.log(`assigning username: ${username}`);
    availableNames.delete(username);
    socket.emit(ActionType.ASSIGN_USERNAME, {
        type: ActionType.ASSIGN_USERNAME,
        username,
    });

    socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {
        socket.broadcast.emit(ActionType.DRAW_PATH, action);
    });

    socket.on(ActionType.MOUSE_MOVE, (action: MouseMoveAction) => {
        socket.broadcast.emit(ActionType.MOUSE_MOVE, action);
    });

    socket.on('disconnect', () => {
        console.log(`User: ${username} disconnected`);
        availableNames.add(username);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});