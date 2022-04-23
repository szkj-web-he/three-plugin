import { Buffer } from 'buffer';
export function fetchFileText(url: string): Promise<string> {
    return fetch(url).then((x) => x.text());
}

export async function fetchFileBuffer(url: string): Promise<Buffer> {
    return Buffer.from(await fetch(url).then((x) => x.arrayBuffer()));
}
