interface TopProps {
    username: string | null,
}

export default function Top({ username }: TopProps) {
    const contents = username ?
        <>you are <span style={{color: 'magenta'}}>{username}</span></>
        :
        null;
    return (
        <div id="top">
            {contents}
        </div>
    );
}