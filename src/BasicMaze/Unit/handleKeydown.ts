import { Mesh } from 'three';
import { MAP, WIDTH } from '../../Unit/unit';

export const handleKeyDown = (e: KeyboardEvent, cursor_mesh: Mesh) => {
    const orig = { x: cursor_mesh.position.x, y: cursor_mesh.position.y };
    switch (e.key) {
        case 'ArrowUp': {
            cursor_mesh.position.y += 1;
            break;
        }
        case 'ArrowDown': {
            cursor_mesh.position.y -= 1;
            break;
        }
        case 'ArrowLeft': {
            cursor_mesh.position.x -= 1;
            break;
        }
        case 'ArrowRight': {
            cursor_mesh.position.x += 1;
            break;
        }
        default: {
            return;
        }
    }

    const i = cursor_mesh.position.x + cursor_mesh.position.y * WIDTH;
    if (MAP[i] === 'X' || MAP[i] === 'W') {
        cursor_mesh.position.x = orig.x;
        cursor_mesh.position.y = orig.y;
    }
};
