export interface UserSettings {
    lineWidth: number,
    lineJoin: CanvasLineJoin,
    lineCap: CanvasLineCap,
    strokeStyle: string,
}

export const defaultSettings: UserSettings = {
    lineWidth: 5,
    lineJoin: 'round',
    lineCap: 'round',
    strokeStyle: 'black',
};