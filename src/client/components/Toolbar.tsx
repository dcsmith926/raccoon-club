import React, { MouseEventHandler, useRef, useState, useContext, } from 'react';
import { ColorChangeHandler, TwitterPicker } from 'react-color';
import { SettingsContext } from '../settings';

interface PropsWithPossibleChildren {
    children: any,
}

function ToolbarItemDialog({children}: PropsWithPossibleChildren) {
    return (
        <div style={{position: 'relative', top: 0, left: 100}}>
            {children}
        </div>
    );
}

function ToolbarItem({ children }: PropsWithPossibleChildren) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const ref = useRef<HTMLLIElement>(null);

    const handleClick: MouseEventHandler = (e) => {
        if (ref.current) {
            if (e.target !== ref.current) {
                return;
            }
            setIsOpen(!isOpen);
        }
    };

    return (
        <li ref={ref} className="toolbar-item" style={{ width: 100, height: 100, backgroundColor: 'gray' }} onClick={handleClick}>
            {isOpen && <ToolbarItemDialog>{children}</ToolbarItemDialog>}
        </li>
    )
}

export default function Toolbar() {

    const settings = useContext(SettingsContext);

    const onChangeColor: ColorChangeHandler = (color) => {
        settings.strokeStyle = color.hex;
        settings.fillStyle = color.hex;
    };

    return (
        <div id="toolbar">
            <ul id="toolbar-list">
                <ToolbarItem>
                    <TwitterPicker triangle="hide" onChange={onChangeColor} />
                </ToolbarItem>
            </ul>
        </div>
    );
}