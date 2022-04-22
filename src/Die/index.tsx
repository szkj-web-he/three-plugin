import { useEffect, useRef } from 'react';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MeshNormalMaterial,
    Mesh,
    Color,
    DoubleSide,
    BufferGeometry,
} from 'three';

import { STLLoader } from '../Unit/STLLoader.js';

import die_stl from './Assets/die.stl';
import { OrbitControls } from '../Unit/OrbitControls';
const Temp = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        let timer: number | null = null;
        let timerOut: number | null = null;
        let rect = node.parentElement?.getBoundingClientRect();
        let w = Math.floor(rect?.width || 0);
        let h = Math.floor(rect?.height || 0);

        // 创建加载器
        const renderer = new WebGLRenderer({ canvas: node });
        // 创建图形
        let geometry: null | BufferGeometry = null;
        // 加载STL的loader
        const loader = new STLLoader();
        // 创建相机
        const camera = new PerspectiveCamera(75, w / h, 0.1, 1000);
        // 轨迹控制器
        const controls = new OrbitControls(camera, node);
        //创建材料
        const material = new MeshNormalMaterial({ side: DoubleSide });
        //加载材料
        let cube: null | Mesh;
        //创建场景
        const scene = new Scene();

        renderer.setSize(w, h);

        const animate = () => {
            if (!cube) return;

            timer = window.requestAnimationFrame(animate);
            controls.update();
            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;

            renderer.render(scene, camera);
        };

        const resizeFn = () => {
            timer && window.cancelAnimationFrame(timer);
            timerOut && window.clearTimeout(timerOut);
            timerOut = window.setTimeout(() => {
                rect = node.parentElement?.getBoundingClientRect();
                w = Math.floor(rect?.width || 0);
                h = Math.floor(rect?.height || 0);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
                animate();
            }, 17);
        };

        void (async () => {
            //创建背景色
            const bg = new Color('rgb(0, 0, 0)');

            const p = new Promise((resolve) => {
                loader.load(die_stl, (res) => {
                    resolve(res);
                });
            });
            await p.then((res) => {
                geometry = res as BufferGeometry;
            });

            if (!geometry) return;
            cube = new Mesh(geometry, material);

            controls.update();

            scene.add(cube);

            camera.position.x = 2;
            camera.position.y = 2;
            camera.position.z = 5;

            renderer.setClearColor(bg, 0);

            animate();
        })();

        window.addEventListener('resize', resizeFn, false);
        return () => {
            timer && window.cancelAnimationFrame(timer);
            timerOut && window.clearTimeout(timerOut);
            renderer.clear();
            geometry?.dispose();
            material.dispose();
            camera.removeFromParent();
            cube?.removeFromParent();
            scene.removeFromParent();
            window.removeEventListener('resize', resizeFn, false);
            renderer.dispose();
            controls.dispose();
        };
    }, []);

    return (
        <div className="subContainer">
            <canvas ref={ref} className="canvas" />
        </div>
    );
};

export default Temp;
