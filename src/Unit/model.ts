import { Object3D, BufferAttribute, BufferGeometry } from 'three';

export abstract class ObjectModel {
    abstract countPolygons(): number;

    asGeometry = (): BufferGeometry => {
        const geo = new BufferGeometry();
        geo.setAttribute('position', new BufferAttribute(this.asVertexBuffer(), 3));
        geo.setAttribute('normal', new BufferAttribute(this.asVertexNormalBuffer(), 3));
        geo.setAttribute('index', new BufferAttribute(this.asIndexBuffer(), 1));
        geo.setAttribute('uv', new BufferAttribute(this.asUVBuffer(), 2));
        // geo = geo.center();
        return geo;
    };

    asVertexBuffer(): Float32Array {
        const count = this.countPolygons();
        return new Float32Array(count * 3 * 3);
    }

    asVertexNormalBuffer(): Float32Array {
        return this.asVertexBuffer();
    }

    asIndexBuffer(): Int32Array {
        const count = this.countPolygons();
        const buf = new Int32Array(count);
        for (let i = 0; i < count; i++) {
            buf[i] = i;
        }
        return buf;
    }

    asUVBuffer(): Int32Array | Float32Array {
        const count = this.countPolygons() * 2;
        return new Int32Array(count);
    }

    abstract asObject(): Object3D;
}
