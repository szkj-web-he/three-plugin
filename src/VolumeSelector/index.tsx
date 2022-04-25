import { useEffect, useRef } from 'react';

import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Mesh,
    Color,
    DoubleSide,
    MeshBasicMaterial,
    Vector3,
    Material,
    BoxGeometry,
} from 'three';

import die_stl from '../Die/Assets/die.stl';
import { OrbitControls } from '../Unit/OrbitControls';
import { BinarySTL } from '../Unit/binary';
import room_stl from './Assets/room.stl';
import { fetchFileBuffer } from '~/Unit/fetchFileBuffer';

const HIGHLIGHT_BOX_SIZE = 1.1;

interface Context {
    mesh: Mesh;
    highlight_material: Material;
    hidden_material: Material;
    highlight_boxes: Mesh[];
    highlight_box_locations: Vector3[];
    camera: PerspectiveCamera;
    r: WebGLRenderer;
    scene: Scene;
}

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
        renderer.setPixelRatio(window.devicePixelRatio);
        // 创建相机
        const camera = new PerspectiveCamera(75, w / h, 0.1, 1000);
        // 轨迹控制器
        const controls = new OrbitControls(camera, node);
        //创建场景
        const scene = new Scene();
        renderer.setSize(w, h);

        //创建room的材料
        const roomMaterial = new MeshBasicMaterial({ color: 0x999999 });
        //创建room物体
        let rootMesh: null | Mesh = null;
        //创建高光材料
        const highlight_material = new MeshBasicMaterial({
            side: DoubleSide,
            color: 0xff0000,
            transparent: true,
            opacity: 0.5,
        });
        //创建隐藏材料
        const hidden_material = new MeshBasicMaterial({
            transparent: true,
            opacity: 0,
        });

        //创建
        const g = new BoxGeometry(HIGHLIGHT_BOX_SIZE, HIGHLIGHT_BOX_SIZE, HIGHLIGHT_BOX_SIZE);
        const gMesh = new Mesh(g, hidden_material);

        //创建几合体
        const highlight_box_locations = [
            [-HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2],
            [-HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2],
            [-HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2],
            [-HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2],
            [HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2],
            [HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2],
            [HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2, -HIGHLIGHT_BOX_SIZE / 2],
            [HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2, HIGHLIGHT_BOX_SIZE / 2],
        ].map(([x, y, z]) => new Vector3(x, y, z));

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

            const room = new BinarySTL(await fetchFileBuffer(room_stl)).asGeometry().center();

            rootMesh = new Mesh(room, roomMaterial);

            scene.add(rootMesh);

            const stl = new BinarySTL(await fetchFileBuffer(die_stl));

            const mesh = stl.asObject();

            const ctx: Context = {
                mesh,
                camera,
                highlight_material,
                hidden_material,
                highlight_box_locations,
                highlight_boxes: highlight_box_locations.map((loc) => {
                    gMesh.position.x = loc.x;
                    gMesh.position.y = loc.y;
                    gMesh.position.z = loc.z;

                    return gMesh;
                }),
                r: renderer,
                scene,
            };

            scene.add(ctx.mesh);
            scene.add(...ctx.highlight_boxes);

            //创建
            controls.update();

            camera.position.z = 5;

            renderer.setClearColor(bg, 0);

            animate();
        })();

        window.addEventListener('resize', resizeFn, false);
        return () => {
            timer && window.cancelAnimationFrame(timer);
            timerOut && window.clearTimeout(timerOut);
            renderer.clear();
            camera.removeFromParent();
            scene.removeFromParent();
            roomMaterial.dispose();
            window.removeEventListener('resize', resizeFn, false);
            renderer.dispose();
            controls.dispose();
            highlight_material.dispose();
            hidden_material.dispose();
            g.dispose();
            rootMesh?.removeFromParent();
            gMesh.removeFromParent();
        };
    }, []);

    return (
        <div className="subContainer">
            <canvas ref={ref} className="canvas" />
        </div>
    );
};

export default Temp;
