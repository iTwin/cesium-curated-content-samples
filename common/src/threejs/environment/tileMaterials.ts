import * as THREE from "three";

export function updateTileMaterials(
  tilesRenderer: any,
  scene: THREE.Scene,
  useSpecular: boolean,
  materialParams: any
) {
    if (!tilesRenderer || !tilesRenderer.group) {
        console.error("tilesRenderer or tilesRenderer.group is undefined. Skipping material update.");
        return;
      }
  tilesRenderer.group.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      if (child.material) {
        // Ensure original material is stored
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = Array.isArray(child.material)
            ? child.material.map((mat: THREE.Material) => mat.clone())
            : child.material.clone();
        }

        if (useSpecular) {
          // Replace with a specular material
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(materialParams.color),
            metalness: materialParams.metalness,
            roughness: materialParams.roughness,
            envMap: scene.environment,
          });
        } else {
          // Restore the original material
          child.material = Array.isArray(child.userData.originalMaterial)
            ? child.userData.originalMaterial.map((mat: THREE.Material) => mat.clone())
            : child.userData.originalMaterial.clone();
        }

        // Ensure shadows and updates
        child.castShadow = true;
        child.receiveShadow = true;

        if (Array.isArray(child.material)) {
          child.material.forEach((material) => (material.needsUpdate = true));
        } else {
          child.material.needsUpdate = true;
        }
      }
    }
  });
}

export function setupTileMaterialGUI(
  gui: any,
  tilesRenderer: any,
  scene: THREE.Scene,
  materialParams: any
) {
    gui
    .add(materialParams, "useSpecular")
    .name("Enable Specular")
    .onChange(() => {
      updateTileMaterials(tilesRenderer, scene, materialParams.useSpecular, materialParams);
    });
    
  const materialFolder = gui.addFolder("Tile Materials");

  materialFolder
    .addColor(materialParams, "color")
    .name("Base Color")
    .onChange(() => {
      updateTileMaterials(tilesRenderer, scene, materialParams.useSpecular, materialParams);
    });

  materialFolder
    .add(materialParams, "metalness", 0, 1, 0.01)
    .name("Metalness")
    .onChange(() => {
      updateTileMaterials(tilesRenderer, scene, materialParams.useSpecular, materialParams);
    });

  materialFolder
    .add(materialParams, "roughness", 0, 1, 0.01)
    .name("Roughness")
    .onChange(() => {
      updateTileMaterials(tilesRenderer, scene, materialParams.useSpecular, materialParams);
    });

  materialFolder.close();
}
