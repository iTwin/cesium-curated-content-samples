import * as THREE from "three";

/**
 * Applies a jitter effect to a light.
 * Supports DirectionalLight, PointLight, and SpotLight.
 */
export function jitterLight(light: THREE.Light, intensity: number = 0.3) {
  const jitterX = (Math.random() - 0.5) * intensity;
  const jitterY = (Math.random() - 0.5) * intensity;
  const jitterZ = (Math.random() - 0.5) * intensity;

  if (light instanceof THREE.DirectionalLight || light instanceof THREE.PointLight || light instanceof THREE.SpotLight) {
    light.position.add(new THREE.Vector3(jitterX, jitterY, jitterZ));
    requestAnimationFrame(() => {
      light.position.sub(new THREE.Vector3(jitterX, jitterY, jitterZ));
    });
  }
}

/**
 * Jitters all lights in the provided array.
 */
export function jitterLights(lights: THREE.Light[], intensity: number = 0.3) {
  lights.forEach((light) => jitterLight(light, intensity));
}
