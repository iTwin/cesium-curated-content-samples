import { GUI } from "lil-gui";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { TAARenderPass } from "../taa/TAARenderPass";
import { createAntialiasGUI } from "./GUI";

export function setupAntialiasing(composer: EffectComposer, scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer, gui?: GUI) {

    // TAA
    const taaPass = new TAARenderPass(scene, camera);
    taaPass.unbiased = true;
    taaPass.sampleLevel = 1;
    taaPass.enabled = false;

    // FXAA
    const fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    fxaaPass.renderToScreen = false;
    fxaaPass.enabled = true;

    if (gui) {
        createAntialiasGUI(gui, taaPass, fxaaPass);
    }

    return function(cameraChanged: boolean, outputPass: OutputPass) {
        outputPass.renderToScreen = false;
        taaPass.render( composer, renderer, cameraChanged );
        outputPass.renderToScreen = true;

        if (cameraChanged || taaPass.accumulateIndex <= 2 && fxaaPass.enabled) {
            fxaaPass.render(renderer, composer.readBuffer, composer.writeBuffer, 0, false);
            outputPass.render(renderer, composer.writeBuffer, composer.readBuffer, 0, false);
        } else {
            outputPass.render(renderer, composer.writeBuffer, composer.writeBuffer, 0, false);
        }
    };
}
