import { WavefrontObject } from './wavefrontGroup';
import { GeoVertex, Normal, TextureMapping } from './type';
import { WavefrontMaterialProvider } from './mtl';
import { WavefrontFormattedFile } from './core';
import { findObjectDelimiters } from './findObjectDelimiters';
import { Group, Mesh } from 'three';

export interface WavefrontGlobs {
    vertices: GeoVertex[];
    mappings: TextureMapping[];
    normals: Normal[];
}

export class WavefrontObj extends WavefrontFormattedFile {
    public objects: WavefrontObject[] = [];
    private readonly globs: WavefrontGlobs = {
        vertices: [],
        mappings: [],
        normals: [],
    };

    constructor(buffer: string, private readonly mtl: WavefrontMaterialProvider) {
        super(buffer);

        this.globs.vertices = this.lines
            .filter((l) => l.command === 'v')
            .map((l) => {
                const [x, y, z] = l.args.map(Number.parseFloat);
                return { x, y, z };
            });

        this.globs.mappings = this.lines
            .filter((l) => l.command === 'vt')
            .map((l) => {
                const [u, v] = l.args.map(Number.parseFloat);
                return { u, v };
            });

        this.globs.normals = this.lines
            .filter((l) => l.command === 'vn')
            .map((l) => {
                const [x, y, z] = l.args.map(Number.parseFloat);
                return {
                    x,
                    y,
                    z,
                };
            });

        this.objects = findObjectDelimiters(this.lines, 'o')
            .map(([i, j]) => this.lines.slice(i, j))
            .flatMap((lines) => new WavefrontObject(this.globs, lines));
    }

    asObject(): Group {
        return new Group().add(...this.asMeshes());
    }

    private asMeshes(): Mesh[] {
        return this.objects.flatMap((o) => o.asMesh(this.mtl));
    }
}
