import io, { Socket } from 'socket.io-client';
import { Point } from '../common/Point';
import { UserSettings, defaultSettings } from '../common/UserSettings';
import {
    Action,
    ActionType,
    AssignUsernameAction,
    DrawPathAction,
    MouseMoveAction,
} from '../common/actions';

const MOUSEMOVE_UPDATE_INTERVAL = 500;

window.onload = initSocket;

let username = '_tmp';

function initSocket() {

    const socket = io();

    socket.on(ActionType.ASSIGN_USERNAME, (action: AssignUsernameAction) => {

        username = action.username;

        init(socket);

        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }

        const top = document.getElementById('top');
        if (top) {
            top.innerHTML = `you are ${username}`;
        }
    });
}

function init(socket: Socket) {

    const settings: UserSettings = {...defaultSettings};

    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    
    let lastMouseMoveUpdate = Date.now();
    let isDrawing = false;
    let path: Point[] = [];

    const drawLine = (start: Point, end: Point, settings: UserSettings) => {
        ctx.beginPath();
        ctx.strokeStyle = settings.strokeStyle;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    };

    const drawPath = (path: Point[], settings: UserSettings) => {

        let point = path.shift();

        if (point) {

            ctx.beginPath();
            ctx.strokeStyle = settings.strokeStyle;
            ctx.moveTo(point.x, point.y);

            point = path.shift();
            while (point) {
                ctx.lineTo(point.x, point.y);
                point = path.shift();
            }

            ctx.stroke();
        }
    }

    const onDrawStart = (point: Point) => {
        isDrawing = true;
        path = [point];
    };

    const onDrawUpdate = (point: Point) => {
        if (isDrawing) {
            const prevPoint = path[path.length - 1];
            drawLine(prevPoint, point, settings);
            path.push(point);
        }
    };
    
    const onDrawEnd = (point: Point) => {

        isDrawing = false;

        emitAction(socket, {
            type: ActionType.DRAW_PATH,
            user: username,
            settings,
            path,
        });
    }

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
        if (!isDrawing) {
            onDrawStart(new Point(e.clientX, e.clientY));
        }
    });

    canvas.addEventListener('mousemove', (e: MouseEvent) => {

        const point = new Point(e.clientX, e.clientY);

        if (isDrawing) {
            onDrawUpdate(point);
        }

        const now = Date.now();

        if (now - lastMouseMoveUpdate > MOUSEMOVE_UPDATE_INTERVAL) {

            lastMouseMoveUpdate = now;

            emitAction(socket, {
                type: ActionType.MOUSE_MOVE,
                user: username,
                settings,
                point,
            });
        }
    });

    canvas.addEventListener('mouseup', (e: MouseEvent) => {
        if (isDrawing) {
            onDrawEnd(new Point(e.clientX, e.clientY));
        }
    });

    canvas.addEventListener('mouseleave', (e: MouseEvent) => {
        if (isDrawing) {
            onDrawEnd(new Point(e.clientX, e.clientY));
        }
    });

    socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {
        drawPath(action.path, action.settings);
    });

    socket.on(ActionType.MOUSE_MOVE, (action: MouseMoveAction) => {
        console.log(`User ${action.user} moved mouse to ${action.point}`);
    });

    clear(ctx);
}

function clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function emitAction(socket: Socket, action: Action) {
    socket.emit(action.type, action);
}