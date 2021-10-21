import { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../socket';
import { IMG_FN } from '../../common/constants';
import { ActionType, AssignUsernameAction } from '../../common/actions';
import Top from './Top';
import Toolbar from './Toolbar';
import PaintCanvas from './PaintCanvas';

export default function App() {

    const [imgLoaded, setImgLoaded] = useState<boolean>(false);
    const [username, setUsername] = useState<string | null>(null);

    const socket = useContext(SocketContext);
    useEffect(() => {
        socket.on(ActionType.ASSIGN_USERNAME, (action: AssignUsernameAction) => {
            setUsername(action.payload.username);
        });
    }, []);

    const imgRef = useRef<HTMLImageElement>(new Image());
    const img = imgRef.current;
    useEffect(() => {
        img.src = IMG_FN;
        img.onload = () => setImgLoaded(true);
    }, []);

    return (
        <div id="container">
            {imgLoaded && username &&
                <>
                    <Top username={username} />
                    <div id="main">
                        <PaintCanvas
                            width={800}
                            height={800}
                            img={img}
                            username={username}
                        />
                        <Toolbar />
                    </div>
                </>
            }
        </div>
    );
}