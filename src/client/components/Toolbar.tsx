import React, { MouseEventHandler, useRef, useState, useContext, } from 'react';
import styled from 'styled-components';
import { ColorChangeHandler, TwitterPicker } from 'react-color';
import { SettingsContext } from '../settings';

const ToolbarWrapper = styled.div`
    border: 1px solid magenta;
    border-radius: 5px;
    padding: 0;
    color: pink;
    font-size: 2rem;
`;

const ToolbarList = styled.ul`
    display: flex;
    flex-direction: col;
    flex-gap: 10px;
    list-style-type: none;
    padding: 0;
    margin: 0;
    overflow: hidden;
`;

const ToolbarLI = styled.li`
    border-top-radius: 5px;
    padding: 5px;
    background-color: white;
    transition: background-color 0.2s ease-out;
    &:hover {
        background-color: magenta;
        cursor: pointer;
    }
`;

const ToolbarItemDialog = styled.div`
    position: relative;
    top: 0;
    left: 200;
`;

const ToolbarInner = styled.div`
    user-select: none;
`;

interface ToolbarItemProps {
    text: string,
    children: any,
}
function ToolbarItem(props: ToolbarItemProps) {

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    const handleClick: MouseEventHandler = (e) => {
        if (ref.current) {
            if (e.target !== ref.current) {
                return;
            }
            setIsOpen(!isOpen);
        }
    };

    return (
        <ToolbarLI>
            <ToolbarInner ref={ref} onClick={handleClick}>{props.text}</ToolbarInner>
            {isOpen && <ToolbarItemDialog>{props.children}</ToolbarItemDialog>}
        </ToolbarLI>
    )
}

export default function Toolbar() {

    const settings = useContext(SettingsContext);

    const onChangeColor: ColorChangeHandler = (color) => {
        settings.strokeStyle = color.hex;
        settings.fillStyle = color.hex;
    };

    return (
        <ToolbarWrapper>
            <ToolbarList>
                <ToolbarItem text="Change Color">
                    <TwitterPicker triangle="hide" onChange={onChangeColor} />
                </ToolbarItem>
            </ToolbarList>
        </ToolbarWrapper>
    );
}