export type Cell = 'W' | 'X' | 'C' | ' ';
export const WIDTH = 12;
export const HEIGHT = 12;
export const MAP = `
XXXXXXXXXXXX
X X        X
X X XX X X X
X XXXXXX X X
X        XXX
X XXXXXX   X
X X    XXX X
X X XX X X X
X   XX     X
X XXXXXXXX X
X XC       X
XXXXXXXXXXXX
`
    .replaceAll(/[\r\n]/g, '')
    .split('') as Cell[];
