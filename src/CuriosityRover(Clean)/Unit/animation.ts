import { DirectionalLight, Object3D, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

function rotateAroundOrigin(obj: Object3D, yaw: number, radius: number) {
    obj.position.x = radius * Math.sin(yaw);
    obj.position.z = radius * Math.cos(yaw);

    obj.rotation.y = yaw;
}

export const animation = (
    renderer: WebGLRenderer,
    r: number,
    light: DirectionalLight,
    camera: PerspectiveCamera,
    scene: Scene,
) => {
    renderer.setAnimationLoop((time) => {
        rotateAroundOrigin(light, time / 1000, r);
        rotateAroundOrigin(camera, time / 1000, r);

        renderer.render(scene, camera);
    });
};
