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
import useMousePosition from '../hooks/useMousePosition';

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

    let mousePos = useMousePosition();

    let mouseMoveIntervalId: number|null = null;

    useEffect(() => {

        if (ref.current) {

            const canvas = ref.current;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.drawImage(img, 0, 0);

            const cm = new CanvasManager(ctx);

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
                    path.push(point);
                }
            };
            
            const onDrawEnd = (point: Point) => {

                isDrawing = false;

                // only one point: draw a point (i.e. ellipse) as we haven't drawn anything yet
                // and send draw point action to peers
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
                // we draw a path -- send it to our peers
                else if (path.length > 1) {
                    emitAction(socket, {
                        type: ActionType.DRAW_PATH,
                        payload: {
                            user: username,
                            settings,
                            path,
                        },
                    });
                }
            };

            // set event listeners on the canvas
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

            // when we receive draw actions from peers, draw the necessary stuff
            socket.on(ActionType.DRAW_POINT, (action: DrawPointAction) => {
                cm.drawPoint(action.payload.point, action.payload.settings);
            });

            socket.on(ActionType.DRAW_LINE, (action: DrawLineAction) => {
                cm.drawLine(action.payload.start, action.payload.end, action.payload.settings);
            });

            socket.on(ActionType.DRAW_PATH, (action: DrawPathAction) => {
                cm.drawPath(action.payload.path, action.payload.settings);
            });

            // when we receive mouse move action from peers
            // TODO: display the peer's icon at the location
            socket.on(ActionType.MOUSE_MOVE, (action: MouseMoveAction) => {
                const { point } = action.payload;
                console.log(`User ${action.payload.user} moved mouse to (${point.x}, ${point.y})`);
            });

            // periodically send updates of our mouse position so we can watch each other moving around
            mouseMoveIntervalId = window.setInterval(() => {
                emitAction(socket, {
                    type: ActionType.MOUSE_MOVE,
                    payload: {
                        user: username,
                        settings,
                        point: translateCanvas(mousePos),
                    },
                });
            }, MOUSEMOVE_UPDATE_INTERVAL);
        }

        // returning our cleanup function from useEffect
        return () => {
            // we have to clear this interval if it's been set
            if (mouseMoveIntervalId !== null) {
                window.clearInterval(mouseMoveIntervalId);
            }
        }
    }, []);

    return (
        <canvas ref={ref} width={width} height={height} />
    );
}