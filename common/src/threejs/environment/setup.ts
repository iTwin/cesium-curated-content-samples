import { GUI } from "lil-gui";
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { setupAntialiasing } from "./antialiasing";
import { setupBloom } from "./bloom";
import { createEnvironment } from "./environment";
import { PointerLockControls } from "./pointer-lock-controls";
import { setupSSAO } from "./ssao";

export function setupThreeJs(parentDiv: HTMLElement, showStats: boolean = true) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.set(20, 5, 20);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  parentDiv.appendChild(renderer.domElement);

  const controls = new PointerLockControls(camera);

  let stats: Stats | null = null;
  if (showStats) {
    stats = new Stats();
    parentDiv.appendChild(stats.dom);
    stats.dom.classList.add("threejs-stats");
  }

  const { directionalLight, sky } = createEnvironment(scene);

  const gui = new GUI({ container: parentDiv });
  gui.domElement.classList.add("threejs-gui");

  const composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const ssaoPass = setupSSAO(renderer, scene, camera, gui);

  const bloomPass = setupBloom(renderer);
  bloomPass.enabled = false;

  composer.addPass(bloomPass);

  composer.addPass(ssaoPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  const renderAA = setupAntialiasing(composer, scene, camera, renderer, gui);

  // Handle Window Resize
  window.addEventListener("resize", onWindowResize);

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
  }

  let renderFrameIndex = 0;
  let lastCameraChangeFrameIndex = 0;

  const events: any = { "update": [] };
  const addEventListener = (message: string, callback: any) => {
    events[message].push(callback);
  };
  
  let antialiasEnabled = true;
  const setAntialias = (enable: boolean) => antialiasEnabled = enable;

  let time = performance.now();
  function renderLoop() {
    requestAnimationFrame(renderLoop);
    
    camera.updateMatrixWorld();
    
    events["update"].forEach((callback: any) => callback());
    
    controls.update((performance.now() - time) / 1000.0);
    time = performance.now();

    // This optimization can help to stop rendering when not necessary. For now, let's not use it.
    // let numAABlendingFrames = antialiasEnabled ? 64 : 1;
    const dirtyFrame = true; // lastCameraChangeFrameIndex >= renderFrameIndex - numAABlendingFrames;

    if (dirtyFrame) {
      const cameraChanged = lastCameraChangeFrameIndex == renderFrameIndex;
      if (antialiasEnabled) {
        renderAA(cameraChanged, outputPass);
      } else {
        // composer.renderToScreen = true;
        composer.render();
      }
      sky.position.copy(camera.position);
    }
    if (stats) {
      stats.update();
    }
    renderFrameIndex ++;
  }
  
  const setCameraDirty = () => { lastCameraChangeFrameIndex = renderFrameIndex; };
  
  controls.addEventListener('change', setCameraDirty);

  const setSSAO = (enable: boolean) => ssaoPass.enabled = enable;
  const setBloom = (enable: boolean) => bloomPass.enabled = enable;
  const setShadows = (enable: boolean) => directionalLight.castShadow = enable;
  const addTileset = (tilesRenderer: any ) => {
    tilesRenderer.setCamera(camera);
    tilesRenderer.setResolutionFromRenderer(camera, renderer);
    scene.add(tilesRenderer.group);
  
    tilesRenderer.addEventListener( "update-after", () => updateTileShadows(tilesRenderer) );
  
    tilesRenderer.addEventListener( "load-content", () => setCameraDirty());
  
    addEventListener("update", () => tilesRenderer.update());
  }
  
  renderLoop();

  return { addEventListener, setAntialias, setCameraDirty, setShadows, gui, scene, setSSAO,
            setBloom, camera, controls, renderer, addTileset, sky };
}

function updateTileShadows(tilesRenderer: any) {
  tilesRenderer.group.traverse((child: any) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}
