import React from 'react';
import { render } from 'react-dom';
import { SocketContext, socket } from './socket';
import App from './components/App';

render(
    <SocketContext.Provider value={socket}>
        <App />
    </SocketContext.Provider>,
    document.getElementById('root-of-all-raccoons'),
);