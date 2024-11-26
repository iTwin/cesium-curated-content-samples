import { Camera, Scene, WebGLRenderer, WebGLRenderTarget } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { SSAARenderPass } from "three/addons/postprocessing/SSAARenderPass.js";

export class TAARenderPass extends SSAARenderPass {
	sampleLevel: number;
	accumulateIndex: number;
	jitterOffsets: [number, number][];
	sampleRenderTarget: WebGLRenderTarget | undefined;

	constructor(scene: Scene, camera: Camera, clearColor?: string, clearAlpha?: number);

	render(composer: EffectComposer, renderer: WebGLRenderer, cameraChanged: boolean): void;
}
