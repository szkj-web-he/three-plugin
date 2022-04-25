import { GeoVertex, Line, Normal, TextureMapping } from './type';
import { WavefrontGlobs } from './wavefrontObj';
import { Mesh } from 'three/src/objects/Mesh';
import { WavefrontMaterialProvider } from './mtl';
import { BufferGeometry } from 'three/src/core/BufferGeometry';
import { BufferAttribute } from 'three/src/core/BufferAttribute';
import { WavefrontParseError } from './core';
import { findObjectDelimiters } from './findObjectDelimiters';

interface SerializedPoint {
    v: number;
    vt: number;
    vn: number;
}

interface Point {
    v: GeoVertex;
    t?: TextureMapping;
    n?: Normal;
}

export interface Face {
    v: GeoVertex[];
    t?: TextureMapping[];
    n?: Normal[];
}

export class WavefrontGroup {
    public name?: string;
    protected material?: string;
    private faces: Face[] = [];

    constructor(protected readonly globs: WavefrontGlobs, protected readonly lines: Line[]) {
        for (const { command, args } of lines) {
            if (command === 'usemtl') {
                this.material = args.join(' ');
            } else if (command === 'f') {
                this.addFace(...args);
            } else if (command === 'o' || command === 'g') {
                this.name = args.join(' ');
            }
        }
    }

    addFace(...args: string[]) {
        if (args.length !== 3) {
            throw new WavefrontParseError(
                'This parser does not accept non-triangulated faces. Please export the model with triangulated faces.',
            );
        }

        const f: Face = { v: [] };
        if (this.globs.mappings && this.material && this.material !== 'None') {
            f.t = [];
        }
        if (this.globs.normals) {
            f.n = [];
        }

        args.map((v) => v.split('/'))
            .map((is) => is.map((i) => Number.parseInt(i, 10)))
            .map<SerializedPoint>(([v, vt, vn]) => ({ v, vt, vn }))
            .map<Point>((sp) => {
                // One indexed ???!?!??!!
                const p: Point = { v: this.globs.vertices[sp.v - 1] };

                // NaN checks
                if (sp.vt === sp.vt) {
                    p.t = this.globs.mappings[sp.vt - 1];
                }
                if (sp.vn === sp.vn) {
                    p.n = this.globs.normals[sp.vn - 1];
                }
                return p;
            })
            .forEach((p) => {
                f.v.push(p.v);
                if (f.t !== undefined && p.t !== undefined) {
                    f.t.push(p.t);
                }
                if (f.n !== undefined && p.n !== undefined) {
                    f.n.push(p.n);
                }
            });

        this.faces.push(f);
    }

    asMesh(mtl: WavefrontMaterialProvider): Mesh[] {
        return [new Mesh(this.asGeometry(), mtl.getMaterial(this.material))];
    }

    public debug() {
        console.debug('  Group', this.name);
        console.debug(this.asVertexBuffer());
    }

    private asGeometry(): BufferGeometry {
        const geo = new BufferGeometry();
        geo.setAttribute('position', new BufferAttribute(this.asVertexBuffer(), 3));
        geo.setAttribute('normal', new BufferAttribute(this.asVertexNormalBuffer(), 3));
        geo.setAttribute('index', new BufferAttribute(this.asIndexBuffer(), 1));
        geo.setAttribute('uv', new BufferAttribute(this.asUVBuffer(), 2));
        return geo;
    }

    private asVertexBuffer(): Float32Array {
        const vertices = this.faces.flatMap<GeoVertex>((f) => f.v);

        const buf = vertices.flatMap((v) => [v.x, v.y, v.z]);

        return new Float32Array(buf);
    }

    private asVertexNormalBuffer(): Float32Array {
        return new Float32Array(
            this.faces
                .flatMap<Normal | undefined>((f) => f.n)
                .flatMap((n) => [n?.x ?? 1, n?.y ?? 1, n?.z ?? 1]),
        );
    }

    private asIndexBuffer(): Int32Array {
        return new Int32Array(this.faces.flatMap((f) => f.v).map((_, i) => i));
    }

    private asUVBuffer(): Float32Array {
        return new Float32Array(
            this.faces
                .flatMap<TextureMapping | undefined>((f) => f.t)
                .flatMap((t) => [t?.u ?? 0, t?.v ?? 0]),
        );
    }
}

export class WavefrontObject extends WavefrontGroup {
    private readonly groups: WavefrontGroup[] | undefined;

    constructor(globs: WavefrontGlobs, lines: Line[]) {
        const has_subgroups = lines.some((l) => l.command === 'g');
        if (has_subgroups) {
            const name = lines.find((l) => l.command === 'o');
            super(globs, name ? [name] : []);

            this.groups = findObjectDelimiters(lines, 'g')
                .map(([i, j]) => lines.slice(i, j))
                .flatMap((lines) => new WavefrontGroup(globs, lines));
        } else {
            super(globs, lines);
        }
    }

    override asMesh(mtl: WavefrontMaterialProvider): Mesh[] {
        if (this.groups) {
            return this.groups.flatMap((g) => g.asMesh(mtl));
        }
        return super.asMesh(mtl);
    }

    override debug() {
        if (this.groups) {
            console.debug('Object', this.name);
            return this.groups.forEach((g) => g.debug());
        }
        return super.debug();
    }
}
