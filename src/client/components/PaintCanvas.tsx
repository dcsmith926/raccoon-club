import { useEffect, useRef, useContext } from 'react';
import { SocketContext, emitAction } from '../socket';
import { SettingsContext } from '../settings';
import {
    ActionType,
    DrawLineAction,
    DrawPathAction,
    DrawPointAction,
    MouseMoveAction,
} from '../../common/actions';
import { MOUSEMOVE_UPDATE_INTERVAL } from '../../common/constants';
import { CanvasManager } from '../../common/CanvasManager';
import { Point } from '../../common/Point';

interface PaintCanvasProps {
    width: number,
    height: number,
    img: HTMLImageElement,
    username: string,
}

export default function PaintCanvas({width, height, img, username}: PaintCanvasProps) {

    const socket = useContext(SocketContext);
    const settings = useContext(SettingsContext);

    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        if (ref.current) {

            const canvas = ref.current;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(img, 0, 0);

            const cm = new CanvasManager(ctx);

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
                            settings,
                            start: prevPoint,
                            end: point,
                        },
                    })
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
                    type: AT.DRAW_PATH,
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
    }, []);

    return (
        <canvas ref={ref} width={width} height={height} />
    );
}