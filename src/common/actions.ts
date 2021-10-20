import { Point } from './Point';
import { UserSettings } from './UserSettings';

export enum ActionType {
    ASSIGN_USERNAME = 'ASSIGN_USERNAME',
    DRAW_POINT = 'DRAW_POINT',
    DRAW_LINE = 'DRAW_LINE',
    DRAW_PATH = 'DRAW_PATH',
    MOUSE_MOVE = 'MOUSE_MOVE',
}

export interface Action {
    type: ActionType,
    payload: any,
}

export interface AssignUsernameAction extends Action {
    type: ActionType.ASSIGN_USERNAME,
    payload: {
        username: string,
    },
}

export interface DrawPointAction extends Action {
    type: ActionType.DRAW_POINT,
    payload: {
        user: string,
        settings: UserSettings,
        point: Point,
    },
}

export interface DrawLineAction extends Action {
    type: ActionType.DRAW_LINE,
    payload: {
        user: string,
        settings: UserSettings,
        start: Point,
        end: Point,
    },
}

export interface DrawPathAction extends Action {
    type: ActionType.DRAW_PATH,
    payload: {
        user: string,
        settings: UserSettings,
        path: Point[],
    },
}

export interface MouseMoveAction extends Action {
    type: ActionType.MOUSE_MOVE,
    payload: {
        user: string,
        settings: UserSettings,
        point: Point,
    },
}