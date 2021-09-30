import fs from 'fs';
import path from 'path';
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
const IMG_PATH = path.resolve(__dirname, 'public', IMG_FN);
const IMG_UPD_INTERVAL = 10000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
const ctx = canvas.getContext('2d');
const cm = new CanvasManager(ctx);

let imgUpdated = true;

const writeImageFile = () => {

    if (imgUpdated) {

        const outStream = fs.createWriteStream(IMG_PATH);
        const inStream = canvas.createPNGStream({
            compressionLevel: 9,
        });

        inStream.pipe(outStream);
        outStream.on('finish', () => console.log(`Wrote canvas data to ${IMG_PATH}`));

        imgUpdated = false;
    }
};

cm.clear();
writeImageFile();
setInterval(writeImageFile, IMG_UPD_INTERVAL);

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
        imgUpdated = true;

        socket.broadcast.emit(ActionType.DRAW_POINT, action);
    });

    socket.on(ActionType.DRAW_LINE, (action: DrawLineAction) => {

        const { start, end, settings } = action.payload;

        cm.drawLine(start, end, settings);
        imgUpdated = true;

        socket.broadcast.emit(ActionType.DRAW_LINE, action);
    });

    socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {

        const { path, settings } = action.payload;

        cm.drawPath(path, settings);
        imgUpdated = true;

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