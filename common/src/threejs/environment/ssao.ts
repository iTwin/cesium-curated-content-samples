import { GUI } from "lil-gui";
import * as THREE from "three";
import { SSAOPass } from "../ssao/SSAOPass";

export function setupSSAO(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera, gui?: GUI) {
    const width = renderer.domElement.width
    const height = renderer.domElement.height;
    
    const ssaoPass = new SSAOPass(scene, camera, width, height);
    ssaoPass.output = SSAOPass.OUTPUT.Default;
    ssaoPass.enabled = true;
    ssaoPass.ssaoMaterial = ssaoPass.advancedSSAO;
    ssaoPass.minDistance = 1.0;
    ssaoPass.maxDistance = 4.0;
    ssaoPass.blurMaterial = ssaoPass.blurMaterialOld;
    ssaoPass.kernelRadius = 47.0;
    ssaoPass.aoPower = 1;
    ssaoPass.kernelSize = 45;
    ssaoPass.blurScale = 1;
    ssaoPass.blurSampleCount = 3;

    if (gui) {
        createGUI(ssaoPass, gui);
    }
    
    return ssaoPass;
}

function createGUI(ssaoPass: SSAOPass, gui: GUI) {
    // SSAO GUI
    const settingsFolder = gui.addFolder("AO Settings");
    settingsFolder.add(ssaoPass, 'enabled').name("Advanced AO").setValue(true);
    // settingsFolder.close(); // Close the folder by default
    settingsFolder.add(ssaoPass, "debugMode").name("Debug Mode").onChange((value: boolean) => {
        ssaoPass.debugMode = value;
    });

    settingsFolder.add(ssaoPass, 'mouseDebugMode').name('Mouse Debug Mode').listen().onChange((value: boolean) => {
        ssaoPass.mouseDebugMode = !!value;
    });

    settingsFolder.close();

    // SSAO Output Controls
    const savedOutput = localStorage.getItem("ssaoOutput") || String(SSAOPass.OUTPUT.Default);
    ssaoPass.output = parseInt(savedOutput, 10) as number;

    settingsFolder.add(ssaoPass, "output", {
        "Default": SSAOPass.OUTPUT.Default,
        "AO Only": SSAOPass.OUTPUT.SSAO,
        "AO + Blur": SSAOPass.OUTPUT.Blur,
        "Depth": SSAOPass.OUTPUT.Depth,
        "Normal": SSAOPass.OUTPUT.Normal,
        "Default + Blur": SSAOPass.OUTPUT.DefaultBlurred,
    }).onChange((value: number) => {
        ssaoPass.output = value;
        localStorage.setItem("ssaoOutput", value.toString());
    });

    // Shader and Blur Configuration
    const savedShaderType = localStorage.getItem("shaderType") || "Advanced";
    const savedBlurShaderType = localStorage.getItem("blurShaderType") || "Blur New";

    const shaderOptions: any = {
        ssaoType: savedShaderType as "Advanced" | "SSAO Old",
        blurType: savedBlurShaderType as "Blur New" | "Blur Old",
    };
    ssaoPass.setShader(savedShaderType as "Advanced" | "SSAO Old");
    ssaoPass.setBlurShader(savedBlurShaderType as "Blur New" | "Blur Old");


    settingsFolder.add(shaderOptions, "ssaoType", ["Advanced", "SSAO Old"] as const)
    .name("AO Type")
    .onChange((value: string) => {
		localStorage.setItem('selectedShader', value);
        ssaoPass.setShader(value as "Advanced" | "SSAO Old");
        localStorage.setItem("shaderType", value);
        window.location.reload();
    });

    settingsFolder.add(shaderOptions, "blurType", ["Blur New", "Blur Old"] as const)
    .name("Blur Type")
    .onChange((value: string) => {
		localStorage.setItem('selectedBlurShader', value);
        ssaoPass.setBlurShader(value as "Blur New" | "Blur Old");
        localStorage.setItem("blurShaderType", value);
        window.location.reload();
    });

    // SSAO Kernel and Distance Controls
    settingsFolder.add(ssaoPass, "kernelRadius", 0, 128).name("Kernel Radius").setValue(47.0);
    const minDistanceControl = settingsFolder.add(ssaoPass, "minDistance", 0.001, 0.02, 0.001).name("Min Distance");
    const maxDistanceControl = settingsFolder.add(ssaoPass, "maxDistance", 0.01, 1.0, 0.01).name("Max Distance");

    function updateShaderSettingsGUI(shaderType: string) {
        let advancedControlsFolder: GUI | undefined = undefined;

        if (shaderType === "Advanced") {
            minDistanceControl.hide();

            if (!advancedControlsFolder) {
            advancedControlsFolder = settingsFolder.addFolder("Advanced Settings");
            }

            maxDistanceControl.name("AO Radius Scale").min(0.01).max(10.0).step(0.1).setValue(8.0);

            advancedControlsFolder.add(ssaoPass, "aoPower", 0.1, 3.0, 0.1)
            .name("AO Power")
            .onChange((value: number) => ssaoPass.setAOPower(value));

            advancedControlsFolder.add(ssaoPass, "kernelSize", 4, 128, 1).name("SSAO Kernel Size")
            .setValue(45).onChange((value: number) => ssaoPass.setKernelSize(value));

            advancedControlsFolder.add(ssaoPass, "blurScale", 0.5, 3.0, 0.1)
            .name("Blur Scale")
            .onChange((value: number) => ssaoPass.setBlurScale(value));

            advancedControlsFolder.add(ssaoPass, "blurSampleCount", 1, 15, 1)
            .name("Blur Sample Count")
            .onChange((value: number) => ssaoPass.setBlurSampleCount(value));

            advancedControlsFolder.show();
        } else {
            minDistanceControl.show();
            maxDistanceControl.name("Max Distance").min(0.01).max(1.0).step(0.01);
        }
    }

    updateShaderSettingsGUI(shaderOptions.ssaoType);    
}