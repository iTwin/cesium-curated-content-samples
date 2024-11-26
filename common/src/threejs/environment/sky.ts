import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";

let isGuiConfigured = false;

// Function to create the advanced dynamic sky
export function createSky(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  gui?: any,
  onSunPositionChange?: (sun: THREE.Vector3) => void
) {
  const sun = new THREE.Vector3();
  const sky = new Sky();
  sky.scale.setScalar(10000);

  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 10; // Cloudiness
  skyUniforms["rayleigh"].value = 2; // Scattering coefficient
  skyUniforms["mieCoefficient"].value = 0.005; // Haze intensity
  skyUniforms["mieDirectionalG"].value = 0.8; // Haze scattering directionality

  let renderTarget: THREE.WebGLRenderTarget | undefined;
  const pmremGenerator = new THREE.PMREMGenerator(renderer);

  const parameters = {
    turbidity: 8.7,
    rayleigh: 2.132,
    mieCoefficient: 0.03,
    mieDirectionalG: 0.0,
    elevation: 7,
    azimuth: -67.8,
    exposure: 0.5,
    sunEnabled: true,
  };

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    skyUniforms["sunPosition"].value.copy(sun);
    skyUniforms["turbidity"].value = parameters.turbidity;
    skyUniforms["rayleigh"].value = parameters.rayleigh;
    skyUniforms["mieCoefficient"].value = parameters.mieCoefficient;
    skyUniforms["mieDirectionalG"].value = parameters.mieDirectionalG;

    renderer.toneMappingExposure = parameters.exposure;

    if (onSunPositionChange) {
      onSunPositionChange(sun.clone().multiplyScalar(50));
    }

    if (renderTarget) renderTarget.dispose();
    renderTarget = pmremGenerator.fromScene(scene);
    scene.environment = renderTarget.texture;
  }

  updateSun();

  if (gui && !isGuiConfigured) {
    isGuiConfigured = true;
    const skyFolder = gui.addFolder("Sky");
    skyFolder.add(parameters, "turbidity", 0.0, 20.0, 0.1).name("Turbidity").onChange(updateSun);
    skyFolder.add(parameters, "rayleigh", 0.0, 4.0, 0.01).name("Rayleigh").onChange(updateSun);
    skyFolder.add(parameters, "mieCoefficient", 0.0, 0.1, 0.001).name("Mie Coefficient").onChange(updateSun);
    skyFolder.add(parameters, "mieDirectionalG", 0.0, 1.0, 0.01).name("Mie Directional G").onChange(updateSun);
    skyFolder.add(parameters, "elevation", 0, 90, 0.1).name("Sun Y Position").onChange(updateSun);
    skyFolder.add(parameters, "azimuth", -180, 180, 0.1).name("Sun X Position").onChange(updateSun);
    skyFolder.close();
    
  }

  scene.add(sky);
}

// Function to create a simple fallback sky
export function createSimpleSky(scene: THREE.Scene) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(5000, 32, 15),
    new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x285390) },
        bottomColor: { value: new THREE.Color(0xeeeeee) },
        horizonColor: { value: new THREE.Color(0xffffff) },
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        uniform vec3 bottomColor;
        varying vec3 vPosition;
        void main() {
          float heightFactor = normalize(vPosition).y;
          if (heightFactor > 0.0) {
            heightFactor = sin(heightFactor * ${Math.PI} / 2.0);
            heightFactor = sin(heightFactor * ${Math.PI} / 2.0);
            gl_FragColor = vec4(mix(horizonColor, topColor, max(heightFactor, 0.0)), 1.0);
          } else {
            gl_FragColor = vec4(bottomColor, 1.0);
          }
        }
      `,
      side: THREE.BackSide,
    })
  );

  scene.add(sky);
  return sky;
}
