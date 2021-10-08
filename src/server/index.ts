import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { createCanvas, } from 'canvas';
import {
    ActionType,
    DrawPointAction,
    DrawLineAction,
    DrawPathAction,
    MouseMoveAction,
} from '../common/actions';
import { CanvasManager } from '../common/CanvasManager';
import { IMG_FN } from '../common/constants';
import { retrieveUsername, returnUsername } from './usernames';

const PORT = 8002;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const ctx = canvas.getContext('2d');
const cm = new CanvasManager(ctx);

cm.clear();

app.get(`/${IMG_FN}`, (req, res) => {

    /**
     * TODO:
     * - should we set any other headers/properties
     *   on the res object or is this good enough?
     */

    res.setHeader('Cache-Control', 'no-store');
    
    const pngStream = canvas.createPNGStream({
        compressionLevel: 9,
    });

    pngStream.pipe(res);
});

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
        const { point, settings } = action.payload;
        cm.drawPoint(point, settings);
        socket.broadcast.emit(ActionType.DRAW_POINT, action);
    });

    socket.on(ActionType.DRAW_LINE, (action: DrawLineAction) => {
        const { start, end, settings } = action.payload;
        cm.drawLine(start, end, settings);
        socket.broadcast.emit(ActionType.DRAW_LINE, action);
    });

    socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {
        const { path, settings } = action.payload;
        cm.drawPath(path, settings);
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