import * as THREE from "three";
import { Lensflare, LensflareElement } from "three/addons/objects/Lensflare.js";

export function addLensflare(light: THREE.PointLight) {
  const textureLoader = new THREE.TextureLoader();

  const textureFlare0 = textureLoader.load('./img/lensflare0.png');
  // const textureFlare1 = textureLoader.load('./img/lensflare2.png');
  const textureFlare2 = textureLoader.load('./img/lensflare3.png');

  const lensflare = new Lensflare();

  lensflare.addElement(new LensflareElement(textureFlare0, 700, 0));
  lensflare.addElement(new LensflareElement(textureFlare2, 512, 0.2));
  lensflare.addElement(new LensflareElement(textureFlare2, 200, 0.4));
  lensflare.addElement(new LensflareElement(textureFlare2, 100, 0.6));
  lensflare.addElement(new LensflareElement(textureFlare2, 60, 0.8));
  lensflare.addElement(new LensflareElement(textureFlare2, 40, 1.0));
  light.add(lensflare);
}

export function removeLensflare(light: THREE.PointLight) {
  // Iterate through the children of the light
  for (let i = light.children.length - 1; i >= 0; i--) {
    const child = light.children[i];

    // Check if the child is an instance of Lensflare
    if (child instanceof Lensflare) {
      light.remove(child); // Remove the lensflare
    }
  }
}