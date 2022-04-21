import { GUI } from 'dat.gui';
import React, { useEffect, useRef } from 'react';

import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Color,
    PointLight,
} from 'three';

const Earth = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        let timer: number | null = null;
        const renderer = new WebGLRenderer({ canvas: node });

        const bg = new Color('rgb(0, 0, 0)');

        const geometry = new BoxGeometry();
        const material = new MeshPhongMaterial({ color: 0x00ffff });
        const cube = new Mesh(geometry, material);

        const scene = new Scene();

        const w = Math.floor(node.clientWidth);
        const h = Math.floor(node.clientHeight);

        renderer.setSize(w, h);
        const camera = new PerspectiveCamera(75, w / h, 0.1, 1000);

        const light = new PointLight();

        light.position.set(0, 0, 5);
        scene.add(light);
        const gui = new GUI();

        const cameraFolder = gui.addFolder('PointLight');
        cameraFolder.add(light.position, 'x', 0, 10);
        cameraFolder.add(light.position, 'y', 0, 10);
        cameraFolder.add(light.position, 'z', 0, 10);

        cameraFolder.open();
        // scene.add(lights[1]);
        // scene.add(lights[2]);

        scene.add(cube);

        camera.position.z = 5;

        renderer.setClearColor(bg, 0);

        const animate = () => {
            timer = window.requestAnimationFrame(animate);

            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;

            renderer.render(scene, camera);
        };
        animate();
        return () => {
            timer && window.cancelAnimationFrame(timer);
            renderer.clear();
            geometry.dispose();
            material.dispose();
            cube.removeFromParent();
        };
    }, []);

    return (
        <div className="subContainer">
            <canvas ref={ref} className="canvas" />
        </div>
    );
};

export default Earth;
