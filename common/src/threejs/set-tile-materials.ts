import { TilesRenderer } from "3d-tiles-renderer";
import * as THREE from "three";
import { GUI } from "lil-gui";

export function setTileMaterialsToWhite(tilesRenderer: TilesRenderer, gui?: GUI) {
    const originalMaterials: { [uuid: string]: THREE.Material | THREE.Material[] } = {};
    let texturesVisible = true;

    // Toggle Textures Control
    if (gui) {
        gui.add({ toggleTextures }, "toggleTextures").name("Toggle Textures");
    }

    function toggleTextures() {
        texturesVisible = !texturesVisible;

        tilesRenderer.group.traverse((child: THREE.Object3D) => {
            if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;

                if (!originalMaterials[mesh.uuid]) {
                    originalMaterials[mesh.uuid] = mesh.material;
                }

                if (!texturesVisible) {
                    mesh.material = Array.isArray(mesh.material)
                    ? mesh.material.map(() => new THREE.MeshStandardMaterial({ color: 0xffffff }))
                    : new THREE.MeshStandardMaterial({ color: 0xffffff });
                } else {
                    mesh.material = originalMaterials[mesh.uuid];
                }

                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((material) => (material.needsUpdate = true));
                } else {
                    mesh.material.needsUpdate = true;
                }
            }
        });
    }
    return toggleTextures;
}