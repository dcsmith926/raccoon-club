import React, { MouseEventHandler, useRef, useState } from 'react';
import { ColorChangeHandler, TwitterPicker } from 'react-color';
import { UserSettings } from '../../common/UserSettings';

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

interface ToolbarProps {
    settings: UserSettings,
    setSettings: React.Dispatch<React.SetStateAction<UserSettings>>,
}
export default function Toolbar({ settings, setSettings }: ToolbarProps) {

    const onChangeColor: ColorChangeHandler = (color) => {
        setSettings({
            ...settings,
            strokeStyle: color.hex,
            fillStyle: color.hex,
        });
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