import io, { Socket } from 'socket.io-client';
import { Point } from '../common/Point';
import { UserSettings, defaultSettings, applySettings } from '../common/UserSettings';
import {
    Action,
    ActionType,
    AssignUsernameAction,
    DrawPointAction,
    DrawLineAction,
    DrawPathAction,
    MouseMoveAction,
} from '../common/actions';

const MOUSEMOVE_UPDATE_INTERVAL = 500;

window.onload = init;

async function init() {

    const spinner = document.getElementById('loading-spinner') as HTMLDivElement;
    const top = document.getElementById('top') as HTMLDivElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const settings: UserSettings = {...defaultSettings};

    const socket = io();

    // maybe there's a cleaner way to write this using async/await..??
    const waitForUsername = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            socket.on(ActionType.ASSIGN_USERNAME, (action: AssignUsernameAction) => {
                resolve(action.payload.username);
            });
        });
    };

    const username = await waitForUsername();

    spinner.style.display = 'none';
    top.innerHTML = `you are ${username}`;

    let lastMouseMoveUpdate = Date.now();
    let isDrawing = false;
    let path: Point[] = [];

    const translateCanvas = (point: Point): Point => {
        const {x, y} = canvas.getBoundingClientRect();
        point.x -= x;
        point.y -= y;
        return point;
    };

    const drawLine = (start: Point, end: Point, settings: UserSettings) => {

        applySettings(ctx, settings);

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    };

    const drawPoint = (point: Point, settings: UserSettings) => {

        applySettings(ctx, settings);

        ctx.beginPath();
        ctx.ellipse(point.x, point.y, 1, 1, 0, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fill();
    };

    const drawPath = (path: Point[], settings: UserSettings) => {

        let point = path.shift();

        if (point) {

            if (path.length === 0) {
                drawPoint(point, settings);
            }
            else {

                applySettings(ctx, settings);

                ctx.beginPath();
                ctx.moveTo(point.x, point.y);

                point = path.shift();
                while (point) {
                    ctx.lineTo(point.x, point.y);
                    point = path.shift();
                }

                ctx.stroke();
            }
        }
    };

    const onDrawStart = (point: Point) => {
        isDrawing = true;
        path = [point];
    };

    const onDrawUpdate = (point: Point) => {
        if (isDrawing) {
            const prevPoint = path[path.length - 1];
            drawLine(prevPoint, point, settings);
            emitAction(socket, {
                type: ActionType.DRAW_LINE,
                payload: {
                    user: username,
                    settings,
                    start: prevPoint,
                    end: point,
                },
            });
            path.push(point);
        }
    };
    
    const onDrawEnd = (point: Point) => {

        isDrawing = false;

        // only one point: draw an ellipse as we haven't drawn anything yet
        if (path.length === 1) {
            drawPoint(point, settings);
            emitAction(socket, {
                type: ActionType.DRAW_POINT,
                payload: {
                    user: username,
                    settings,
                    point,
                },
            });
        }

        /*
        emitAction(socket, {
            type: ActionType.DRAW_PATH,
            user: username,
            settings,
            path,
        });
        */
    }

    canvas.addEventListener('mousedown', (e: MouseEvent) => {
        if (!isDrawing) {
            onDrawStart(translateCanvas(new Point(e.clientX, e.clientY)));
        }
    });

    canvas.addEventListener('mousemove', (e: MouseEvent) => {

        const point = translateCanvas(new Point(e.clientX, e.clientY));

        if (isDrawing) {
            onDrawUpdate(point);
        }

        const now = Date.now();

        if (now - lastMouseMoveUpdate > MOUSEMOVE_UPDATE_INTERVAL) {

            lastMouseMoveUpdate = now;

            emitAction(socket, {
                type: ActionType.MOUSE_MOVE,
                payload: {
                    user: username,
                    settings,
                    point,
                },
            });
        }
    });

    canvas.addEventListener('mouseup', (e: MouseEvent) => {
        if (isDrawing) {
            onDrawEnd(translateCanvas(new Point(e.clientX, e.clientY)));
        }
    });

    canvas.addEventListener('mouseleave', (e: MouseEvent) => {
        if (isDrawing) {
            onDrawEnd(translateCanvas(new Point(e.clientX, e.clientY)));
        }
    });

    socket.on(ActionType.DRAW_POINT, (action: DrawPointAction) => {
        drawPoint(action.payload.point, action.payload.settings);
    });

    socket.on(ActionType.DRAW_LINE, (action: DrawLineAction) => {
        drawLine(action.payload.start, action.payload.end, action.payload.settings);
    });

    socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {
        drawPath(action.payload.path, action.payload.settings);
    });

    socket.on(ActionType.MOUSE_MOVE, (action: MouseMoveAction) => {
        console.log(`User ${action.payload.user} moved mouse to ${action.payload.point}`);
    });

    clear(ctx);
}

function clear(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function emitAction(socket: Socket, action: Action) {
    socket.emit(action.type, action);
}