import * as THREE from "three";
import { GUI } from "lil-gui";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export function setupBloom(renderer: THREE.WebGLRenderer, gui?: GUI) {
    // Configure bloom Pass
    let bloomEnabled = true;
    const bloomParams = {
        enabled: bloomEnabled,
        strength: 0.25,    // Bloom strength/intensity
        threshold: 0.99,   // Bloom threshold
        radius: 0.25       // Bloom radius
    };

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(renderer.domElement.clientWidth, renderer.domElement.clientHeight),
        bloomParams.strength,
        bloomParams.radius,
        bloomParams.threshold
    );
    bloomPass.enabled = bloomEnabled;

    if (gui) {
        //GUI for Bloom
        gui.add(bloomParams, "enabled")
        .name("Enable Bloom")
        .onChange((value: boolean) => {
            bloomEnabled = value;
            bloomPass.enabled = bloomEnabled;
        });

        const bloomFolder = gui.addFolder("Bloom Settings");
        bloomFolder.add(bloomParams, "strength", 0, 3, 0.1).name("Bloom Strength").onChange((value: number) => {
            bloomPass.strength = value;
        });
        bloomFolder.add(bloomParams, "threshold", 0, 1, 0.01).name("Bloom Threshold").onChange((value: number) => {
         bloomPass.threshold = value;
        });
        bloomFolder.add(bloomParams, "radius", 0, 1, 0.01).name("Bloom Radius").onChange((value: number) => {
            bloomPass.radius = value;
        });

        bloomFolder.close();
    }

    return bloomPass;
}