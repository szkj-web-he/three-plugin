import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

export interface Range {
    min: number;
    max: number;
}

export interface Bounds {
    x?: Range;
    y?: Range;
    z?: Range;
}

const clamp = (val: number, lim?: { min: number; max: number }): [number, boolean] => {
    if (!lim) return [val, false];

    if (val < lim.min) return [lim.min, true];
    if (val > lim.max) return [lim.max, true];

    return [val, false];
};

export function computeTomography(geo: BufferGeometry, bounds: Bounds): BufferGeometry {
    const newGeo = new BufferGeometry();

    console.log('1111', geo.getAttribute('uv'));
    const pos: Float32Array = geo.getAttribute('position').array as Float32Array;
    const normal: Float32Array = geo.getAttribute('normal').array as Float32Array;
    const uv: Int32Array = geo.getAttribute('uv').array as Int32Array;

    const tris = pos.length / 9;

    const newIndex: Array<number> = [];
    const newPos: Array<number> = [];
    const newNormal: Array<number> = [];
    const newUv: Array<number> = [];

    for (let t = 0; t < tris; t++) {
        let recalculate = false;
        let exclude = true;
        const points: Array<number> = [];
        for (let p = 0; p < 3; p++) {
            const ix = t * 9 + p * 3;
            const iy = ix + 1;
            const iz = ix + 2;

            const [px, cx] = clamp(pos[ix], bounds.x);
            const [py, cy] = clamp(pos[iy], bounds.y);
            const [pz, cz] = clamp(pos[iz], bounds.z);
            points.push(px, py, pz);

            const pointClamped = cx || cy || cz;
            recalculate = recalculate || pointClamped;
            exclude = exclude && pointClamped;
        }
        if (exclude) {
            continue;
        } else {
            newPos.push(...points);
            newIndex.push(t);
            uv.slice(t * 6, (t + 1) * 6).forEach((item) => {
                newUv.push(item);
            });
        }

        let nx: number;
        let ny: number;
        let nz: number;
        if (recalculate) {
            let i = 0;
            const p1 = new Vector3(points[i++], points[i++], points[i++]);
            const p2 = new Vector3(points[i++], points[i++], points[i++]);
            const p3 = new Vector3(points[i++], points[i++], points[i++]);
            const a = p2.sub(p1);
            const b = p3.sub(p1);

            nx = a.y * b.z - a.z * b.y;
            ny = a.z * b.x - a.x * b.z;
            nz = a.x * b.y - a.y * b.x;
        } else {
            nx = normal[t * 9];
            ny = normal[t * 9 + 1];
            nz = normal[t * 9 + 2];
        }

        for (let p = 0; p < 3; p++) {
            newNormal.push(nx, ny, nz);
        }
    }

    newGeo.setAttribute('position', new BufferAttribute(new Float32Array(newPos), 3));
    newGeo.setAttribute('normal', new BufferAttribute(new Float32Array(newNormal), 3));
    newGeo.setAttribute('index', new BufferAttribute(new Int32Array(newIndex), 1));
    newGeo.setAttribute('uv', new BufferAttribute(new Int32Array(newUv), 2));

    return newGeo;
}
