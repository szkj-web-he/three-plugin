import { WavefrontFormattedFile } from './core';
import { Color, MeshPhongMaterial, MeshNormalMaterial, MeshBasicMaterial, Material } from 'three';

export interface WavefrontMaterialProvider {
    hasMaterial(name?: string): boolean;

    getMaterial(name?: string): Material;
}

export class WavefrontMtl extends WavefrontFormattedFile implements WavefrontMaterialProvider {
    private materials: Record<string, MeshPhongMaterial> = {};

    constructor(buffer: string) {
        super(buffer);

        let targetMtl = '';
        for (const line of this.lines) {
            if (line.command === 'newmtl') {
                targetMtl = line.args.join(' ');
                continue;
            }

            this.updateMaterial(targetMtl, (p) => {
                const args = line.args.map(Number.parseFloat);
                switch (line.command) {
                    case 'Ka':
                        p.emissive = new Color(args[0], args[1], args[2]);
                        break;

                    case 'Kd':
                        p.color = new Color(args[0], args[1], args[2]);
                        break;

                    case 'Ks':
                        p.specular = new Color(args[0], args[1], args[2]);
                        break;

                    case 'Ns':
                        // In MTL it's 0-1000 but in three it's 0-100
                        p.shininess = args[0] / 10;
                        break;

                    case 'Ke':
                        p.emissive = new Color(args[0], args[1], args[2]);
                        break;

                    case 'Ni':
                        p.refractionRatio = args[0];
                        break;

                    case 'illum':
                        // XXX Not sure how to handle illumination profiles
                        if (args[0] == 0) {
                            p.colorWrite = false;
                        }
                        break;

                    case 'Tr':
                        args[0] = 1 - args[0];
                        break;
                    case 'd':
                        p.opacity = args[0];
                        if (args[0] < 1) {
                            p.transparent = true;
                        }
                        break;
                    default:
                        break;
                }
            });
        }
    }

    getMaterial(name = 'None'): Material {
        const name_l = name.toLowerCase();
        if (name === 'None' || name_l == 'pivot' || name_l.startsWith('shadow')) {
            console.warn(`Objects will not be rendered when the material name is ${name}`);
            return new MeshBasicMaterial({ name, opacity: 0, transparent: true });
        }

        return this.materials[name] ?? new MeshBasicMaterial({ name, color: 0xff0000 });
    }

    updateMaterial(name: string, update: (p: MeshPhongMaterial) => void) {
        let mat = this.materials[name];
        if (mat === undefined) {
            this.materials[name] = new MeshPhongMaterial({ name });
            mat = this.materials[name];
        }
        update(mat);
    }

    hasMaterial(): boolean {
        return false;
    }
}

export class BasicMaterialProvider implements WavefrontMaterialProvider {
    getMaterial(): Material {
        return new MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    }

    hasMaterial(): boolean {
        return true;
    }
}

export class NormalMaterialProvider implements WavefrontMaterialProvider {
    getMaterial(): Material {
        return new MeshNormalMaterial({ wireframe: true });
    }

    hasMaterial(): boolean {
        return true;
    }
}

export class PhongMaterialProvider implements WavefrontMaterialProvider {
    getMaterial(): Material {
        return new MeshPhongMaterial({ color: 0xff0000 });
    }

    hasMaterial(): boolean {
        return true;
    }
}

export class HardcodedMaterialProvider implements WavefrontMaterialProvider {
    private materials: Record<string, MeshPhongMaterial> = {};

    registerMaterial(name: string, material: MeshPhongMaterial) {
        this.materials[name] = material;
    }

    getMaterial(name = 'None'): Material {
        const mat = this.materials[name];
        if (mat) {
            return mat;
        }

        if (name === 'None') {
            return new MeshBasicMaterial({ color: 0x00ff00 });
        }

        console.warn('Material', name, 'not registered, returning default material.');

        return new MeshPhongMaterial({ color: 0xff0000 });
    }

    hasMaterial(name = 'None'): boolean {
        return !!this.materials[name];
    }
}
