import { Point } from "./Point";
import { UserSettings } from "./UserSettings";

export class CanvasManager {

    constructor(public ctx: CanvasRenderingContext2D) {
    }

    applySettings(settings: UserSettings) {
        this.ctx.lineWidth = settings.lineWidth;
        this.ctx.lineJoin = settings.lineJoin;
        this.ctx.lineCap = settings.lineCap;
        this.ctx.strokeStyle = settings.strokeStyle;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    drawPoint(point: Point, settings: UserSettings) {
        this.applySettings(settings);
        this.ctx.beginPath();
        this.ctx.ellipse(point.x, point.y, 1, 1, 0, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.fill();
    }

    drawLine(start: Point, end: Point, settings: UserSettings) {
        this.applySettings(settings);
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
    }

    drawPath(path: Point[], settings: UserSettings) {

        let point = path.shift();

        if (point) {

            if (path.length === 0) {
                this.drawPoint(point, settings);
            }
            else {

                this.applySettings(settings);

                this.ctx.beginPath();
                this.ctx.moveTo(point.x, point.y);

                point = path.shift();
                while (point) {
                    this.ctx.lineTo(point.x, point.y);
                    point = path.shift();
                }

                this.ctx.stroke();
            }
        }
    }
}