import { Line } from './type';

type WavefrontTreeItemDelimiter = 'o' | 'g' | 'newmtl';

export function findObjectDelimiters(
    lines: Line[],
    delimiter: WavefrontTreeItemDelimiter,
): [number, number | undefined][] {
    const points = lines
        .map((l, i) => ({ l, i }))
        .filter(({ l }) => l.command === delimiter)
        .map(({ i }) => i);

    return points.map((point, i) => [point, points[i + 1]]);
}
