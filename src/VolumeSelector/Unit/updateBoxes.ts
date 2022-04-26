import { Euler, Mesh, Vector3 } from 'three';

export const updateBoxes = (
    pitch: number,
    yaw: number,
    meshes: Mesh[],
    positions?: (Vector3 | null)[],
) => {
    for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        mesh.rotation.x = pitch;
        mesh.rotation.y = -yaw;

        const pos = positions?.[i];
        if (pos) {
            mesh.position.x = pos.x;
            mesh.position.y = pos.y;
            mesh.position.z = pos.z;
            mesh.position.applyEuler(new Euler(pitch, -yaw, 0));
        }
    }
};
