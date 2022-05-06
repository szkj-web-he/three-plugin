import React, { useEffect, useRef } from 'react';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MeshNormalMaterial,
    MeshBasicMaterial,
    Mesh,
    BoxGeometry,
} from 'three';
import { OrbitControls } from '../Unit/OrbitControls';
import { handleKeyDown } from './Unit/handleKeydown';
import { Cell, HEIGHT, MAP, WIDTH } from '../Unit/unit';

const Temp: React.FC = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        let timer: number | null = null;
        let timerOut: number | null = null;

        const scene = new Scene();
        const wall_material: MeshNormalMaterial = new MeshNormalMaterial();
        const cursor_material: MeshBasicMaterial = new MeshBasicMaterial({ color: 0xff0000 });
        const walls: BoxGeometry[] = MAP.filter((c) => c === 'X').map(
            () => new BoxGeometry(1, 1, 1),
        );
        const cursor: BoxGeometry = new BoxGeometry(1, 1, 1);
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
        renderer.setPixelRatio(2);

        const camera = new PerspectiveCamera(45, width / height, 0.01, 1000);
        camera.position.x = 10 + WIDTH / 2;
        camera.position.y = HEIGHT / 2;
        camera.position.z = 70;
        camera.rotation.y = 45 * ((Math.PI * 2) / 360);

        const controls = new OrbitControls(camera, node);
        controls.update();

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

        const listener = (e: KeyboardEvent) => {
            handleKeyDown(e, cursor_mesh);
        };

        document.addEventListener('keydown', listener);

        const animate = () => {
            timer = window.requestAnimationFrame(animate);
            controls.update();
        };

        animate();
        const resizeFn = () => {
            timer && window.cancelAnimationFrame(timer);
            timerOut && window.clearTimeout(timerOut);
            timerOut = window.setTimeout(() => {
                rect = node.parentElement?.getBoundingClientRect();
                width = Math.floor(rect?.width || 0);
                height = Math.floor(rect?.height || 0);
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
                animate();
            }, 17);
        };

        window.addEventListener('resize', resizeFn, false);

        return () => {
            document.removeEventListener('keydown', listener);
            timer && window.cancelAnimationFrame(timer);
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

    return (
        <div className="subContainer">
            <canvas ref={ref} className="canvas" />
        </div>
    );
};

export default Temp;
