import React, { useEffect, useRef } from 'react';

import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MeshNormalMaterial,
    Mesh,
    Color,
    DoubleSide,
    sRGBEncoding,
    BufferGeometry,
} from 'three';

import die_stl from '../Die/Assets/die.stl';
import { OrbitControls } from '../Unit/OrbitControls';
import { helper } from '../Unit/helper';
import { computeTomography } from './Unit/computeTomography';
import { BinarySTL } from '../Unit/binary';
import { fetchFileBuffer } from '../Unit/fetchFileBuffer';

const Temp: React.FC = () => {
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
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.outputEncoding = sRGBEncoding;
        // 创建图形
        let geometry: null | BufferGeometry = null;
        // 创建相机
        const camera = new PerspectiveCamera(75, w / h, 0.1, 1000);
        // 轨迹控制器
        const controls = new OrbitControls(camera, node);
        //创建材料
        const material = new MeshNormalMaterial({
            side: DoubleSide,
            vertexColors: true,
            transparent: true,
        });
        //加载材料
        let cube: null | Mesh;
        //创建场景
        const scene = new Scene();

        helper(camera, scene);
        renderer.setSize(w, h);

        const animate = () => {
            timer = window.requestAnimationFrame(animate);
            controls.update();

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

            const stl = new BinarySTL(await fetchFileBuffer(die_stl));
            //创建

            geometry = stl.asGeometry().center();
            cube = new Mesh(geometry, material);
            cube.position.x += 2;
            scene.add(cube);

            const geo = computeTomography(geometry, {
                y: { min: -1, max: 0 },
                z: { min: -1, max: 0.7 },
            });
            cube = new Mesh(geo, material);
            cube.position.x -= 2;
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
