import * as THREE from "three";
import GUI from "lil-gui";
import { createGround } from "./ground";
import { createSimpleSky } from "./sky";

export function createEnvironment(scene: THREE.Scene, gui?: GUI, addHelpers: boolean = false) {
    const sunColor = 0xffffdd;
    // Lights
    let shadowMapSize = 2048;
    const directionalLight = new THREE.DirectionalLight(sunColor, 2);
    directionalLight.position.set(-25, 15, -25);
    directionalLight.castShadow = true;  // Enable shadows for the directional light
    directionalLight.shadow.mapSize.width = shadowMapSize;  // Shadow map resolution
    directionalLight.shadow.mapSize.height = shadowMapSize;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.bias = -0.001;

    // Adjust shadow camera frustum
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -50;

    const hemisphereTop = 0xffffff; 
    const hemisphereBottom = 0xaaaaaa;
    const hermisphereIntensity = 2.5;


    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 0.0;
    const hemisphereLight = new THREE.HemisphereLight(hemisphereTop, hemisphereBottom, hermisphereIntensity);
    hemisphereLight.position.set(0, 1, 0);

    scene.add(directionalLight, ambientLight, hemisphereLight);

    if (addHelpers) {
        // Light 3D Helpers
        const directionalLightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
        const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, 2);
        const directionalLightShadowHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(directionalLightHelper);
        scene.add(hemisphereLightHelper);
        scene.add(directionalLightShadowHelper);
    }

    const sky = createSimpleSky(scene);
      

    const ground = createGround();
    ground.position.y = -50;
    ground.receiveShadow = false;
    //scene.add(ground);

    if (gui) {
        const lightFolder = gui.addFolder("Lights");
        lightFolder.add(directionalLight, "visible").name("Directional Light");
        lightFolder.add(ambientLight, "visible").name("Ambient Light");
        lightFolder.add(hemisphereLight, "visible").name("Hemisphere Light");
        
        lightFolder.add(directionalLight, "intensity", 0, 10, 0.1).name("Directional Light Intensity");
        lightFolder.add(hemisphereLight, "intensity", 0, 10, 0.1).name("Hemisphere Light Intensity");
        lightFolder.close();
        /*
            // Add GUI toggle control for shadows
            gui.add({ shadowsEnabled }, "shadowsEnabled")
            .name("Shadow Map")
            .onChange((value) => {
                shadowsEnabled = value;
                updateTileShadows();
            });

            const shadowMapOptions: { [key: string]: THREE.ShadowMapType } = {
            "Basic": THREE.BasicShadowMap,
            "PCF": THREE.PCFShadowMap,
            "PCF Soft": THREE.PCFSoftShadowMap,
            "VSM": THREE.VSMShadowMap,
            };
        */
    }

  return { directionalLight, ambientLight, hemisphereLight, sky };
}
