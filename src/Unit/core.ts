import { Line } from './type';

export class WavefrontParseError extends Error {}

export class WavefrontFormattedFile {
    protected readonly lines: Line[];

    constructor(buffer: string) {
        this.lines = buffer
            .split('\n')
            .map((s, i) => ({ raw_string: s.trimStart(), line_number: i + 1 }))
            .filter((x) => !x.raw_string.startsWith('#'))
            .map((x) => ({ ...x, raw_string: x.raw_string.split('#')[0].trimEnd() }))
            .map((x) => {
                const parts = x.raw_string.split(' ');

                return { ...x, command: parts[0], args: parts.splice(1) };
            });
    }
}
