import { HalfFloatType, WebGLRenderTarget } from 'three';
import { SSAARenderPass } from "three/addons/postprocessing/SSAARenderPass.js";

class TAARenderPass extends SSAARenderPass {

	constructor( scene, camera, clearColor, clearAlpha ) {

		super( scene, camera, clearColor, clearAlpha );

		this.sampleLevel = 0;
		this.accumulateIndex = 0;
		this.jitterOffsets = [ [0, 0], [ 4, 4 ], [ -4, -4 ] ];
		for(let i = 0; i < 64; i++) {
			this.jitterOffsets.push([(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 16]);
		}
	}

	render( composer, renderer, cameraChanged ) {
		
		const readBuffer = composer.readBuffer;

		if ( this.sampleRenderTarget === undefined ) {
			this.sampleRenderTarget = new WebGLRenderTarget( readBuffer.width, readBuffer.height, { type: HalfFloatType } );
			this.sampleRenderTarget.texture.name = 'TAARenderPass.sample';
		}

		if (cameraChanged) {
			this.accumulateIndex = 0;
		}

		const oldAutoClear = renderer.autoClear;
		const oldClearAlpha = renderer.getClearAlpha();
		renderer.getClearColor( this._oldClearColor );

		renderer.autoClear = false;

		const numSamplesPerFrame = 1 + this.sampleLevel;
		const maxSamples = this.jitterOffsets.length;

		for ( let i = 0; i < numSamplesPerFrame && this.accumulateIndex < maxSamples; i ++ ) {

			const jitterOffset = this.jitterOffsets[ this.accumulateIndex ];
			if ( this.camera.setViewOffset ) {
				const jitter = [ jitterOffset[ 0 ] * 0.0625, jitterOffset[ 1 ] * 0.0625 ];
				this.camera.setViewOffset( readBuffer.width, readBuffer.height, jitter[0], jitter[1], readBuffer.width, readBuffer.height );
				this.camera.jitter = jitter;
			}

			composer.renderToScreen = false;
			composer.render();

			this.copyUniforms[ 'opacity' ].value = 1.0 / maxSamples;
			this.copyUniforms[ 'tDiffuse' ].value = composer.writeBuffer.texture;

			renderer.setRenderTarget( this.sampleRenderTarget );
			if ( this.accumulateIndex === 0 ) {
				renderer.setClearColor( 0x000000, 0.0 );
				renderer.clear();
			}
			this.fsQuad.render( renderer );
			this.accumulateIndex ++;
		}

		if (this.camera.clearViewOffset) {
			this.camera.clearViewOffset();
			delete this.camera.jitter;
		}

		renderer.setClearColor( this.clearColor, this.clearAlpha );

		const writeBuffer = composer.writeBuffer;
		this.copyUniforms[ 'opacity' ].value = maxSamples / this.accumulateIndex;
		this.copyUniforms[ 'tDiffuse' ].value = this.sampleRenderTarget.texture;
		renderer.setRenderTarget( writeBuffer );
		renderer.clear();
		this.fsQuad.render( renderer );

		renderer.autoClear = oldAutoClear;
		renderer.setClearColor( this._oldClearColor, oldClearAlpha );
	}

	dispose() {
		super.dispose();
	}

}

export { TAARenderPass };
