import { useEffect, useRef, useState } from 'react';

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
    Object3D,
    Camera,
} from 'three';
import { OrbitControls } from '../Unit/OrbitControls';
import Operation from '../Operation/index';

const DEGREES = Math.PI / 180;
interface Context {
    camera: Camera;
    scene: Scene;
    sphereMesh: Object3D;
    renderer: WebGLRenderer;
    controls: OrbitControls;
}

const Earth = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const [lat, setLat] = useState<null | number>(null);
    const [lng, setLng] = useState<null | number>(null);
    const ctxRef = useRef<Context>();
    const timer = useRef<null | number>(null);
    const timerOut = useRef<null | number>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

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

        const renderer = new WebGLRenderer({ canvas: node, antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(bg, 0);

        ctxRef.current = {
            camera,
            scene,
            sphereMesh: cube,
            renderer,
            controls,
        };

        const animate = () => {
            timer.current = window.requestAnimationFrame(animate);

            controls.update();

            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;

            renderer.render(scene, camera);
        };
        const resizeFn = () => {
            timer.current && window.cancelAnimationFrame(timer.current);
            timerOut.current && window.clearTimeout(timerOut.current);
            timerOut.current = window.setTimeout(() => {
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
            timer.current && window.cancelAnimationFrame(timer.current);
            timerOut.current && window.clearTimeout(timerOut.current);
            renderer.clear();
            geometry.dispose();
            material.dispose();
            controls.dispose();
            cube.removeFromParent();
            scene.removeFromParent();
            window.removeEventListener('resize', resizeFn, false);
            renderer.dispose();
            ctxRef.current = undefined;
        };
    }, []);

    useEffect(() => {
        if (!ctxRef.current) return;

        timer.current && window.cancelAnimationFrame(timer.current);
        timerOut.current && window.clearTimeout(timerOut.current);
        let animate: () => void;

        // Not null and not NaN
        if (lat !== null && lng !== null) {
            ctxRef.current.sphereMesh.rotation.x = lat * DEGREES;
            ctxRef.current.sphereMesh.rotation.z = (-lng + 90) * DEGREES;

            animate = () => {
                timer.current = window.requestAnimationFrame(animate);

                if (!ctxRef.current) return;

                ctxRef.current.controls.update();

                ctxRef.current.sphereMesh.rotation.x += 0.005;
                ctxRef.current.sphereMesh.rotation.y += 0.005;

                ctxRef.current.renderer.render(ctxRef.current.scene, ctxRef.current.camera);
            };
        } else {
            ctxRef.current.sphereMesh.rotation.x = 0;
            ctxRef.current.sphereMesh.rotation.z = 0;
            animate = () => {
                timer.current = window.requestAnimationFrame(animate);

                if (!ctxRef.current) return;
                ctxRef.current.sphereMesh.rotation.z += 0.005;
                ctxRef.current.controls.update();

                ctxRef.current.renderer.render(ctxRef.current.scene, ctxRef.current.camera);
            };
        }
        timerOut.current = window.setTimeout(animate, 100);
        return () => {
            timer.current && window.cancelAnimationFrame(timer.current);
            timerOut.current && window.clearTimeout(timerOut.current);
        };
    }, [lat, lng]);

    return (
        <div className="subContainer">
            <Operation
                label={[
                    {
                        name: 'Latitude',
                        placeholder: '-123.45',
                        onChange: (res) => setLat(Number.parseFloat(res)),
                    },
                    {
                        name: 'Longitude',
                        placeholder: '12.34',
                        onChange: (res) => setLng(Number.parseFloat(res)),
                    },
                ]}
            />
            <canvas ref={ref} className="canvas" />
        </div>
    );
};

export default Earth;
