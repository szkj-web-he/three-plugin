import { useEffect, useRef } from 'react';

import atmos from './Assets/earth_atmos_2048.jpg';
import specular from './Assets/earth_specular_2048.jpg';
import normal from './Assets/earth_normal_2048.jpg';

import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    SphereGeometry,
    MeshPhongMaterial,
    TextureLoader,
    Mesh,
    DirectionalLight,
    Color,
    AmbientLight,
    Vector2,
} from 'three';
import { OrbitControls } from '../Unit/OrbitControls';

const Earth = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        let timer: number | null = null;
        let timerOut: number | null = null;

        const radius = 6371;

        const bg = new Color('rgb(0, 0, 0)');

        const geometry = new SphereGeometry(radius, 100, 50);
        const loader = new TextureLoader();

        const material = new MeshPhongMaterial({
            specular: 0xe6e6e6,
            shininess: 15,
            map: loader.load(atmos),
            specularMap: loader.load(specular),
            normalMap: loader.load(normal),

            normalScale: new Vector2(0.85, -0.85),
        });
        const cube = new Mesh(geometry, material);

        const scene = new Scene();

        let rect = node.parentElement?.getBoundingClientRect();
        let w = Math.floor(rect?.width || 0);
        let h = Math.floor(rect?.height || 0);

        const camera = new PerspectiveCamera(25, w / h, 50, 1e7);

        const dirLight = new DirectionalLight(0xffffff);
        dirLight.position.set(-1, 0, 1).normalize();
        scene.add(dirLight);

        const light = new AmbientLight(0xffffff, 0.5); // soft white light
        scene.add(light);

        scene.add(cube);

        camera.position.z = radius * 5;

        const controls = new OrbitControls(camera, node);

        controls.update();

        const renderer = new WebGLRenderer({ canvas: node });
        renderer.setSize(w, h);
        renderer.setClearColor(bg, 0);

        const animate = () => {
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
        window.addEventListener('resize', resizeFn, false);

        animate();
        return () => {
            timer && window.cancelAnimationFrame(timer);
            timerOut && window.clearTimeout(timerOut);
            renderer.clear();
            geometry.dispose();
            material.dispose();
            controls.dispose();
            cube.removeFromParent();
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

export default Earth;
