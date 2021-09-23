export interface UserSettings {
    lineWidth: number,
    lineJoin: CanvasLineJoin,
    lineCap: CanvasLineCap,
    strokeStyle: string,
}

export const defaultSettings: UserSettings = {
    lineWidth: 10,
    lineJoin: 'round',
    lineCap: 'round',
    strokeStyle: 'black',
};

export const applySettings = (ctx: CanvasRenderingContext2D, settings: UserSettings) => {
    ctx.lineWidth = settings.lineWidth;
    ctx.lineJoin = settings.lineJoin;
    ctx.lineCap = settings.lineCap;
    ctx.strokeStyle = settings.strokeStyle;
};