export interface UserSettings {
    lineWidth: number,
    lineJoin: CanvasLineJoin,
    lineCap: CanvasLineCap,
    strokeStyle: string,
    fillStyle: string,
}

export const defaultSettings: UserSettings = {
    lineWidth: 5,
    lineJoin: 'round',
    lineCap: 'round',
    strokeStyle: 'pink',
    fillStyle: 'pink',
};