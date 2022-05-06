import React, { useEffect, useRef, useState } from 'react';
import {
    Color,
    DirectionalLight,
    MeshPhongMaterial,
    PerspectiveCamera,
    Scene,
    TextureLoader,
    WebGLRenderer,
} from 'three';
import { fetchFileText } from '../Unit/fetchFileBuffer';
import { WavefrontMtl } from '../Unit/mtl';
import { WavefrontObj } from '../Unit/wavefrontObj';
import msl_clean_mtl from './Assets/MSL_clean.mtl';
import msl_clean_obj from './Assets/MSL_clean.obj';
import parts_AO from './Assets/parts_AO.png';
import tex_01 from './Assets/tex_01.png';
import tex_02 from './Assets/tex_02.png';
import tex_03 from './Assets/tex_03.png';
import tex_03_n from './Assets/tex_03_n.png';
import tex_04 from './Assets/tex_04.png';
import tex_05 from './Assets/tex_05.png';
import { animation } from './Unit/animation';

const RADIUS = 5;

const Temp: React.FC = () => {
    const ref = useRef<HTMLCanvasElement | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        let timerOut: number | null = null;
        let rect = node.parentElement?.getBoundingClientRect();
        let w = Math.floor(rect?.width || 0);
        let h = Math.floor(rect?.height || 0);

        // 创建加载器
        const renderer = new WebGLRenderer({ canvas: node });
        renderer.setPixelRatio(window.devicePixelRatio);
        //创建背景色
        const bg = new Color('rgb(0, 0, 0)');
        // 创建相机
        const camera = new PerspectiveCamera(75, w / h, 0.1, 1000);
        camera.position.y = 1;
        camera.position.z = RADIUS;

        //创建场景
        const scene = new Scene();

        //创建平行光
        //头部
        const topLight = new DirectionalLight();
        topLight.position.y = 10;
        scene.add(topLight);
        //全局
        const light = new DirectionalLight(0xffffff, 0.6);
        scene.add(light);

        renderer.setSize(w, h);

        const resizeFn = () => {
            timerOut && window.clearTimeout(timerOut);
            renderer.setAnimationLoop(null);

            timerOut = window.setTimeout(() => {
                rect = node.parentElement?.getBoundingClientRect();
                w = Math.floor(rect?.width || 0);
                h = Math.floor(rect?.height || 0);
                camera.aspect = w / h;
                animation(renderer, RADIUS, light, camera, scene);
                camera.updateProjectionMatrix();
                renderer.setSize(w, h);
            }, 17);
        };

        void (async () => {
            const mtl = new WavefrontMtl(await fetchFileText(msl_clean_mtl));
            const obj = new WavefrontObj(await fetchFileText(msl_clean_obj), mtl);
            const tex_array = Promise.all([
                new TextureLoader().loadAsync(parts_AO),
                new TextureLoader().loadAsync(tex_01),
                new TextureLoader().loadAsync(tex_02),
                new TextureLoader().loadAsync(tex_03),
                new TextureLoader().loadAsync(tex_03_n),
                new TextureLoader().loadAsync(tex_04),
                new TextureLoader().loadAsync(tex_05),
            ]);
            setLoading(false);
            scene.add(obj.asObject());

            const [parts_AO_i, tex_01_i, tex_02_i, tex_03_i, tex_03_n_i, tex_04_i, tex_05_i] =
                await tex_array;

            mtl.updateMaterial('parts_AO', (p) => (p.aoMap = parts_AO_i));
            mtl.updateMaterial('tex_01', (p) => (p.map = tex_01_i));
            mtl.updateMaterial('tex_02', (p) => (p.map = tex_02_i));

            const tex_03_update = (p: MeshPhongMaterial) => {
                p.map = tex_03_i;
                p.normalMap = tex_03_n_i;
            };
            mtl.updateMaterial('tex_03', tex_03_update);
            mtl.updateMaterial('tex_03.002', tex_03_update);
            mtl.updateMaterial('tex_03_n', tex_03_update);
            mtl.updateMaterial('tex_04', (p) => (p.map = tex_04_i));
            mtl.updateMaterial('tex_05', (p) => (p.map = tex_05_i));

            renderer.setClearColor(bg, 0);
            animation(renderer, RADIUS, light, camera, scene);
        })();

        window.addEventListener('resize', resizeFn, false);
        return () => {
            timerOut && window.clearTimeout(timerOut);
            renderer.setAnimationLoop(null);
            renderer.clear();
            camera.removeFromParent();
            scene.removeFromParent();
            topLight.dispose();
            light.dispose();
            window.removeEventListener('resize', resizeFn, false);
            renderer.dispose();
        };
    }, []);

    return (
        <div className="subContainer">
            {loading && (
                <span className="loading_container">
                    <>资源加载中....</>
                </span>
            )}
            <canvas ref={ref} className="canvas" />
        </div>
    );
};

export default Temp;
