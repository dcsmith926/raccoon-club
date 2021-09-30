import io, { Socket } from 'socket.io-client';
import { Point } from '../common/Point';
import { UserSettings, defaultSettings } from '../common/UserSettings';
import { CanvasManager } from '../common/CanvasManager';
import { IMG_FN } from '../common/constants';
import {
    Action,
    ActionType,
    AssignUsernameAction,
    DrawPointAction,
    DrawLineAction,
    DrawPathAction,
    MouseMoveAction,
} from '../common/actions';

const MOUSEMOVE_UPDATE_INTERVAL = 400;

window.onload = init;

async function init() {

    const spinner = document.getElementById('loading-spinner') as HTMLDivElement;
    const top = document.getElementById('top') as HTMLDivElement;
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const cm = new CanvasManager(ctx);
    const settings: UserSettings = defaultSettings;

    const socket = io();

    // there's probably a cleaner way to write this kinda stuff using async/await..??
    // but this works for now and is clear
    const loadImage = (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = IMG_FN;
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
                resolve(true);
            };
        });
    };

    const getUsername = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            socket.on(ActionType.ASSIGN_USERNAME, (action: AssignUsernameAction) => {
                resolve(action.payload.username);
            });
        });
    };

    const imgLoaded = await loadImage();
    const username = await getUsername();

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

    const onDrawStart = (point: Point) => {
        isDrawing = true;
        path = [point];
    };

    const onDrawUpdate = (point: Point) => {
        if (isDrawing) {
            const prevPoint = path[path.length - 1];
            cm.drawLine(prevPoint, point, settings);
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
            cm.drawPoint(point, settings);
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
        cm.drawPoint(action.payload.point, action.payload.settings);
    });

    socket.on(ActionType.DRAW_LINE, (action: DrawLineAction) => {
        cm.drawLine(action.payload.start, action.payload.end, action.payload.settings);
    });

    socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {
        cm.drawPath(action.payload.path, action.payload.settings);
    });

    socket.on(ActionType.MOUSE_MOVE, (action: MouseMoveAction) => {
        const { point } = action.payload;
        console.log(`User ${action.payload.user} moved mouse to (${point.x}, ${point.y})`);
    });
}

function emitAction(socket: Socket, action: Action) {
    socket.emit(action.type, action);
}