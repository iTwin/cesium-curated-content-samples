import { TilesRenderer } from "3d-tiles-renderer";
import * as THREE from "three";
import { ITwinMeshExportServicePlugin } from "./ITwinMeshExportServicePlugin";

export function createTileRenderer(tilesetUrl: URL, onTilesLoaded?: (boundingSphere: any) => void) {
    const tilesRenderer = new TilesRenderer(tilesetUrl.toString());
    tilesRenderer.registerPlugin(new ITwinMeshExportServicePlugin(tilesetUrl.search));
    
    tilesRenderer.addEventListener( "load-tile-set", () => {
        // Tilesets from the mesh export service are positioned on earth's surface, like Cesium Ion tilesets.
        // So here we orient it such that up is Y+ and center the model
        // Based on the 3DTilesRendererJS Cesium Ion example: https://github.com/NASA-AMMOS/3DTilesRendererJS/blob/master/example/ionExample.js#L78
        const sphere = new THREE.Sphere();
        tilesRenderer.getBoundingSphere(sphere);
    
        const position = sphere.center.clone();

        // Get distance from origin to the center of the tileset bounding sphere
        const distanceToEllipsoidCenter = position.length();
    
        // Get the direction of this vector, which should be "up" in the model, as it's sitting on earth's surface
        // Aka surfaceDirection is the surface normal
        const surfaceDirection = position.normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const rotationToNorthPole = rotationBetweenDirections(surfaceDirection, up);

        // tilesRenderer.group.setRotationFromQuaternion(rotationToNorthPole);
    
        tilesRenderer.group.quaternion.x = rotationToNorthPole.x;
        tilesRenderer.group.quaternion.y = rotationToNorthPole.y;
        tilesRenderer.group.quaternion.z = rotationToNorthPole.z;
        tilesRenderer.group.quaternion.w = rotationToNorthPole.w;
    
        tilesRenderer.group.position.y = -distanceToEllipsoidCenter;
        // tilesRenderer.group.position.copy(sphere.center).multiplyScalar(-1);
        if (onTilesLoaded) {
            onTilesLoaded(sphere);
        }
    });

    return tilesRenderer;  
}

function rotationBetweenDirections(dir1: THREE.Vector3, dir2: THREE.Vector3) {
    const rotation = new THREE.Quaternion();
    const a = new THREE.Vector3().crossVectors(dir1, dir2);
    rotation.x = a.x;
    rotation.y = a.y;
    rotation.z = a.z;
    rotation.w = 1 + dir1.clone().dot(dir2);
    rotation.normalize();
  
    return rotation;
}  
