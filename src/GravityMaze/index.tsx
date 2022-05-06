import React, { useEffect, useRef, useState } from 'react';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MeshNormalMaterial,
    MeshBasicMaterial,
    Mesh,
    SphereGeometry,
    BoxGeometry,
} from 'three';
import { Cell, HEIGHT, MAP, WIDTH } from '../Unit/unit';

const Temp: React.FC = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const [c, setC] = useState<PerspectiveCamera>();
    const [m, setM] = useState<Mesh>();

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        let timerOut: number | null = null;

        const scene = new Scene();
        const wall_material: MeshNormalMaterial = new MeshNormalMaterial();
        const cursor_material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0xff0000 });
        const walls: BoxGeometry[] = MAP.filter((c) => c === 'X').map(() => new BoxGeometry());
        const cursor = new SphereGeometry(0.5);
        const wall_meshes: Mesh[] = walls.map((w) => new Mesh(w, wall_material));
        scene.add(...wall_meshes);
        const cursor_mesh = new Mesh(cursor, cursor_material);
        scene.add(cursor_mesh);

        let w = 0;

        for (let x = 0; x < WIDTH; x++) {
            for (let y = 0; y < HEIGHT; y++) {
                const i = x + y * WIDTH;
                const cell: Cell = MAP[i];

                switch (cell) {
                    case 'W': {
                        wall_meshes[w].position.x = x;
                        wall_meshes[w].position.y = y;
                        w++;
                        break;
                    }
                    case 'X': {
                        wall_meshes[w].position.x = x;
                        wall_meshes[w].position.y = y;
                        w++;
                        break;
                    }
                    case 'C': {
                        cursor_mesh.position.x = x;
                        cursor_mesh.position.y = y;
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        }

        let rect = node.parentElement?.getBoundingClientRect();
        let width = Math.floor(rect?.width || 0);
        let height = Math.floor(rect?.height || 0);
        const renderer = new WebGLRenderer({ canvas: node, antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(1);

        const camera = new PerspectiveCamera(30, width / height, 0.01, 1000);
        camera.position.x = WIDTH / 2;
        camera.position.y = HEIGHT / 2;
        camera.position.z = 50;

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

        const listener = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft': {
                    camera.rotation.z -= 15 * ((Math.PI * 2) / 360);
                    break;
                }
                case 'ArrowRight': {
                    camera.rotation.z += 15 * ((Math.PI * 2) / 360);
                    break;
                }
                default: {
                    return;
                }
            }
        };

        document.addEventListener('keydown', listener);
        setC(camera);
        setM(cursor_mesh);
        const resizeFn = () => {
            timerOut && window.clearTimeout(timerOut);
            timerOut = window.setTimeout(() => {
                rect = node.parentElement?.getBoundingClientRect();
                width = Math.floor(rect?.width || 0);
                height = Math.floor(rect?.height || 0);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }, 17);
        };

        window.addEventListener('resize', resizeFn, false);

        return () => {
            document.removeEventListener('keydown', listener);
            timerOut && window.clearTimeout(timerOut);
            renderer.clear();
            for (let i = 0; i < walls.length; i++) {
                walls[i].dispose();
            }
            cursor.dispose();

            for (let i = 0; i < wall_meshes.length; i++) {
                wall_meshes[i].removeFromParent();
            }

            wall_material.dispose();
            cursor_material.dispose();
            cursor_mesh.removeFromParent();
            scene.removeFromParent();
            window.removeEventListener('resize', resizeFn, false);
            renderer.dispose();
        };
    }, []);

    useEffect(() => {
        if (!c || !m) {
            return;
        }
        const collide = (cur_x: number, cur_y: number, radius: number): boolean => {
            const coords = [[cur_x, cur_y]];
            radius;
            const colls = coords
                .map(([x, y]) => {
                    return Math.round(x) + Math.round(y) * WIDTH;
                })
                .map((item) => {
                    return MAP[item] === 'X' || MAP[item] === 'W';
                });

            return colls.filter((x) => x).length > 0;
        };

        let timer: null | number = null;
        let [vx, vy] = [0, 0];
        const fn = () => {
            timer = window.requestAnimationFrame(fn);
            const orig = { x: m.position.x, y: m.position.y };
            const angle = c.rotation.z;

            if (angle) {
                vx += Math.sin(angle) / 500;
                vy += Math.cos(angle) / 500;
            } else {
                if (vx !== 0) {
                    vx += (vx * -1) / 500;
                }

                if (vy !== 0) {
                    vy += (vx * -1) / 500;
                }
            }

            m.position.x += vx;

            if (collide(m.position.x, m.position.y, 0.5)) {
                m.position.x = orig.x;
                vx = 0;
            }

            m.position.y -= vy;
            if (collide(m.position.x, m.position.y, 0.5)) {
                m.position.y = orig.y;
                vy = 0;
            }
        };
        fn();
        return () => {
            timer && window.cancelAnimationFrame(timer);
        };
    }, [c, m]);

    return (
        <div className="subContainer">
            <canvas ref={ref} className="canvas" />
        </div>
    );
};

export default Temp;
