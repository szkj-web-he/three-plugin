import { useEffect, useRef } from 'react';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    Color,
    AxesHelper,
    PointLight,
} from 'three';
import { OrbitControls } from '../Unit/OrbitControls';
const Temp = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        let timer: number | null = null;
        let timerOut: number | null = null;
        //创建加载器
        const renderer = new WebGLRenderer({ canvas: node });
        //创建背景色
        const bg = new Color('rgb(0, 0, 0)');
        //创建图形
        const geometry = new BoxGeometry();
        //创建材料
        const material = new MeshPhongMaterial({ color: 0x00ffff });
        //加载材料
        const cube = new Mesh(geometry, material);

        //创建场景
        const scene = new Scene();
        let rect = node.parentElement?.getBoundingClientRect();
        let w = Math.floor(rect?.width || 0);
        let h = Math.floor(rect?.height || 0);

        renderer.setSize(w, h);
        //创建相机
        const camera = new PerspectiveCamera(75, w / h, 0.1, 3000);

        const controls = new OrbitControls(camera, node);

        controls.update();

        //创建光源
        const light: PointLight[] = [];
        light[0] = new PointLight(0xffffff, 1, 1, 0);
        light[1] = new PointLight(0xffffff, 1, 1, 0);
        light[2] = new PointLight(0xffffff, 1, 1, 0);

        light[0].position.set(2, 2, 5);
        scene.add(light[0]);
        light[1].position.set(-40, -60, -100);
        scene.add(light[1]);
        light[2].position.set(30, 33, -50);
        scene.add(light[2]);

        scene.add(cube);

        const axesHelper = new AxesHelper(5);
        scene.add(axesHelper);

        camera.position.x = 3;
        camera.rotation.y = 45 * 2 * Math.PI;
        camera.position.z = 5;

        renderer.setClearColor(bg, 0);

        const animate = () => {
            timer = window.requestAnimationFrame(animate);
            controls.update();
            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;
            renderer.render(scene, camera);
        };

        animate();
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
        return () => {
            timer && window.cancelAnimationFrame(timer);
            timerOut && window.clearTimeout(timerOut);
            geometry.dispose();
            material.dispose();
            cube.removeFromParent();
            scene.removeFromParent();
            camera.removeFromParent();
            controls.dispose();
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
