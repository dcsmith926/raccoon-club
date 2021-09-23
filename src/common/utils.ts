export function randomChoice<T>(choices: Array<T>): T {
    return choices[Math.floor(Math.random() * choices.length)];
}