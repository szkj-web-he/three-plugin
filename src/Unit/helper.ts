import { GridHelper, CameraHelper, Camera, Scene, ArrowHelper, Vector3 } from 'three';

export const helper = (camera: Camera, scene: Scene) => {
    const helper = new CameraHelper(camera);
    scene.add(helper);

    const dir = new Vector3(1, 2, 0);

    //normalize the direction vector (convert to vector of length 1)
    dir.normalize();

    const origin = new Vector3(0, 0, 0);
    const length = 1;
    const hex = 0x000000;
    const arrowHelper = new ArrowHelper(dir, origin, length, hex);
    scene.add(arrowHelper);

    const size = 10;
    const divisions = 10;

    const gridHelper = new GridHelper(size, divisions);
    scene.add(gridHelper);
};
