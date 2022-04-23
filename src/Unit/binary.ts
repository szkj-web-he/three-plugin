import { MeshNormalMaterial, Mesh, DoubleSide, BufferGeometry } from 'three';
import { ObjectModel } from './model';

interface Vertex {
    x: number;
    y: number;
    z: number;
}

interface Triangle {
    a: Vertex;
    b: Vertex;
    c: Vertex;
}

/**
 * Little-endian Binary STL to geometry buffer converter helper class
 **/
export class BinarySTL extends ObjectModel {
    private readonly tris: number;

    constructor(private buffer: Buffer) {
        super();
        this.tris = buffer.readUInt32LE(80);
    }

    // See here for references of the STL file structure: https://en.wikipedia.org/wiki/STL_(file_format)#Binary_STL
    index = (n: number): number => {
        return 80 + 4 + n * 50;
    };

    getTriangle = (n: number): Triangle => {
        const i = this.index(n) + 12;
        const a = this.getVertex(i);
        const b = this.getVertex(i + 12);
        const c = this.getVertex(i + 24);

        return { a, b, c };
    };

    getNormal = (n: number): Vertex => {
        return this.getVertex(this.index(n));
    };

    getVertex = (offset: number): Vertex => {
        // Note: Cardinal directions of STLs are slightly different to ones in GL/GPU-space
        const x = this.buffer.readFloatLE(offset);
        const z = -this.buffer.readFloatLE(offset + 4);
        const y = this.buffer.readFloatLE(offset + 8);

        return { x, y, z };
    };

    asVertexBuffer = (): Float32Array => {
        const buf: number[] = [];
        for (let i = 0; i < this.tris; i++) {
            const tri = this.getTriangle(i);
            buf.push(
                ...Object.values(tri).flatMap<number, Vertex>((v) => Object.values(v as number[])),
            );
        }

        return new Float32Array(buf);
    };

    asVertexNormalBuffer = (): Float32Array => {
        const buf: number[] = [];
        for (let i = 0; i < this.tris; i++) {
            const normal = this.getNormal(i);
            const values = Object.values(normal);
            for (let j = 0; j < 3; j++) {
                for (let n = 0; n < values.length; n++) {
                    buf.push(values[n] as number);
                }
            }
        }

        return new Float32Array(buf);
    };

    asObject = (): Mesh<BufferGeometry, MeshNormalMaterial> => {
        return new Mesh(this.asGeometry().center(), new MeshNormalMaterial({ side: DoubleSide }));
    };

    countPolygons(): number {
        return this.tris;
    }
}
