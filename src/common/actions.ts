import { Point } from './Point';
import { UserSettings } from './UserSettings';

export enum ActionType {
    ASSIGN_USERNAME = 'ASSIGN_USERNAME',
    DRAW_PATH = 'DRAW_PATH',
    MOUSE_MOVE = 'MOUSE_MOVE',
}

export interface AssignUsernameAction {
    type: ActionType.ASSIGN_USERNAME,
    username: string,
}

export interface DrawPathAction {
    type: ActionType.DRAW_PATH,
    user: string,
    settings: UserSettings,
    path: Point[],
}

export interface MouseMoveAction {
    type: ActionType.MOUSE_MOVE,
    user: string,
    settings: UserSettings,
    point: Point,
}

export type Action = AssignUsernameAction
                   | DrawPathAction
                   | MouseMoveAction;