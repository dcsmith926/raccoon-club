export interface UserSettings {
    lineWidth: number,
    lineJoin: string,
    lineCap: string,
    strokeStyle: string,
}

export const defaultSettings: UserSettings = {
    lineWidth: 4,
    lineJoin: 'round',
    lineCap: 'round',
    strokeStyle: 'black',
};