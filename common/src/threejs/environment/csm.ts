// @ts-nocheck
import * as THREE from "three";
import { CSM } from "three/addons/csm/CSM.js";
import { CSMHelper } from "three/addons/csm/CSMHelper.js";

function createCSM() {
/*
// CSM
let csmEnabled = false;
let csm: CSM | undefined;
let csmHelper: CSMHelper | undefined;
type CSMMode = 'uniform' | 'logarithmic' | 'practical';

const params = {
  shadows: true,
  cascades: 4,
  fade: true,
  far: 1000,
  mode: "practical" as CSMMode,
  margin: 100,
  lightNear: 1,
  lightFar: 5000,
  autoUpdateHelper: true,
  updateHelper: function () {
    if (csmHelper) csmHelper.update();
  },
};
if (csmEnabled) {
    directionalLight.visible = false; // Disable the original directional light
    // Initialize CSM
    csm = new CSM({
      maxFar: params.far,
      cascades: params.cascades,
      mode: params.mode,
      parent: scene,
      shadowMapSize: 2048,
      lightDirection: directionalLight.position.clone().normalize().negate(),
      camera: camera,
    });
    csmHelper = new CSMHelper(csm);
    csmHelper.visible = false;
    scene.add(csmHelper);

    csm.lights.forEach(light => {
      light.castShadow = true;
      light.intensity = 1.0; // Adjust this to balance brightness
      scene.add(light);
    });
  } else {
    directionalLight.visible = true; // Re-enable original directional light
    if (csm) {
      csm.lights.forEach(light => scene.remove(light));
      scene.remove(csmHelper!);
      csm = undefined;
      csmHelper = undefined;
    }
  }    
const shadowMapFolder = gui.addFolder("Shadow Map Settings");
shadowMapFolder
  .add({ type: "PCF Soft" }, "type", Object.keys(shadowMapOptions))
  .name("Shadow Map Type")
  .onChange((value: string) => {
    renderer.shadowMap.type = shadowMapOptions[value];
  });

  shadowMapFolder.add({ csmEnabled }, 'csmEnabled').name('Enable CSM').onChange(value => {
    csmEnabled = value;
    createCSM();
  });

shadowMapFolder.close();


const csmSettingsFolder = gui.addFolder("CSM Settings");

csmSettingsFolder.add(params, "fade").name("Shadow Fade").onChange(value => {
  if (csm) csm.fade = value;
});

csmSettingsFolder.add(params, "far", 1, 5000).step(1).name("Shadow Far").onChange(value => {
  if (csm) csm.maxFar = value;
  csm!.updateFrustums();
});

csmSettingsFolder.add(params, "mode", ["uniform", "logarithmic", "practical"]).name("Frustum Split Mode").onChange(value => {
  if (csm) csm.mode = value;
  csm!.updateFrustums();
});

csmSettingsFolder.add(params, "margin", 0, 200).name("Light Margin").onChange(value => {
  csm!.lightMargin = value;
  csm!.updateFrustums();
});

csmSettingsFolder.add(params, "lightNear", 1, 10000).name("Light Near").onChange(value => {
  csm!.lights.forEach(light => {
    light.shadow.camera.near = value;
    light.shadow.camera.updateProjectionMatrix();
  });
});

csmSettingsFolder.add(params, "lightFar", 1, 10000).name("Light Far").onChange(value => {
  csm!.lights.forEach(light => {
    light.shadow.camera.far = value;
    light.shadow.camera.updateProjectionMatrix();
  });
});
csmSettingsFolder.close();    
*/
}