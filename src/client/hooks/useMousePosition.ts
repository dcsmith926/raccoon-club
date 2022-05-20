import { useState, useEffect, } from 'react';
import { Point } from '../../common/Point';

export default function useMousePosition () {

    const [pos, setPos] = useState(new Point(0, 0));

    useEffect(() => {

        const listener = (e: MouseEvent) => {
            setPos(new Point(e.clientX, e.clientY));
        };

        window.addEventListener('mousemove', listener);

        return () => window.removeEventListener('mousemove', listener);
    }, []);

    return pos;
}