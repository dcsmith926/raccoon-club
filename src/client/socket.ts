import { createContext } from 'react';
import io, { Socket } from 'socket.io-client';
import { Action } from '../common/actions';

export const socket = io();
export const SocketContext = createContext(socket);

export function emitAction(socket: Socket, action: Action) {
    socket.emit(action.type, action);
}