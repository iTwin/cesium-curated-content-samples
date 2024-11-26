import { GUI } from "lil-gui";

export function setupSkyGUI(gui: GUI, environment: any) {
  let useAdvancedSky: boolean = true;

  gui
    .add({ useAdvancedSky }, "useAdvancedSky")
    .name("Advanced Sky")
    .onChange((value: boolean) => {
      environment.setSkyMode(value);
    });
}

export function setupLensEffectGUI(gui: GUI, environment: any) {
  
    let lensflareEnabled: boolean = true;
    gui
      .add({ lensflareEnabled }, "lensflareEnabled")
      .name("Lens Flare")
      .onChange((value: boolean) => {
        environment.setLensflare(value);
      });
}
  
export function createSceneGUI(threejs: any) {
  const gui = threejs.gui;

  const update = (callback: (value: any) => void) => {
    return (value: any) => {
      if (callback) {
        callback(value);
      }
      threejs.setCameraDirty();
    };
  };

  let shadowsEnabled: boolean = false;
  gui
    .add({ shadowsEnabled }, "shadowsEnabled")
    .name("Dynamic Shadows")
    .onChange(update((value) => threejs.setShadows(value)));

  let ssaoEnabled: boolean = false;
  gui
    .add({ ssaoEnabled }, "ssaoEnabled")
    .name("Ambient Occlusion")
    .onChange(update((value) => threejs.setSSAO(value)));

  let bloomEnabled: boolean = false;
  gui
    .add({ bloomEnabled }, "bloomEnabled")
    .name("Bloom")
    .onChange(update((value) => threejs.setBloom(value)));

  let antialiasEnabled: boolean = false;
  gui
    .add({ antialiasEnabled }, "antialiasEnabled")
    .name("Antialiasing")
    .onChange(update((value) => threejs.setAntialias(value)));
}

export function createAntialiasGUI(gui: any, taaPass: any, fxaaPass: any) {
  const antiAliasingFolder = gui.addFolder("Anti-Aliasing");
  antiAliasingFolder.add(taaPass, "sampleLevel", 0, 3, 1).name("Quality").onChange((value: number) =>  taaPass.sampleLevel = value);
  antiAliasingFolder.add(fxaaPass, 'enabled').name("FXAA").setValue(true);
  antiAliasingFolder.close();
}