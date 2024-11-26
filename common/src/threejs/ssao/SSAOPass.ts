import { AddEquation, Color, CustomBlending, DataTexture, DepthStencilFormat, DepthTexture, DstAlphaFactor, DstColorFactor, FloatType, HalfFloatType, Line, Material, MeshNormalMaterial, NearestFilter, NoBlending, Object3D, PerspectiveCamera, Points, RedFormat, RepeatWrapping, Scene, ShaderMaterial, Texture, TextureLoader, UniformsUtils, UnsignedInt248Type, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget, ZeroFactor } from "three";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js";
import { FullScreenQuad, Pass } from "three/examples/jsm/postprocessing/Pass.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";
import { SSAOBlurShader as SSAOBlurShaderOld, SSAOShader as SSAOShaderOld } from "three/examples/jsm/shaders/SSAOShader.js";
import { SSAOBlurShader, SSAODepthShader, SSAOShader } from "./SSAOShader";

class SSAOPass extends Pass {

	static OUTPUT = {
		Default: 0,
		SSAO: 1,
		Blur: 2,
		Depth: 3,
		Normal: 4,
		DefaultBlurred: 5
	  };

	width: number;
	height: number;
	camera: PerspectiveCamera;
	scene: Scene;
	kernelSize: number = 45;
	kernelRadius: number = 47;
	kernel: Vector3[] = [];
	noiseTexture: Texture | null = null;
	output: number;
	minDistance: number = 0.005;
	maxDistance: number = 0.1;
	aoPower: number = 1.5;
	blurScale: number = 1.0;
	blurSampleCount: number = 3;
	_visibilityCache: Map<Object3D, boolean> = new Map();
	debugMode: boolean = false;
	mouseDebugMode: boolean = false;
	mouseUV: Vector2 = new Vector2(0.0, 0.0);
	advancedSSAO: ShaderMaterial;
	oldSSAO: ShaderMaterial;
	ssaoMaterial: ShaderMaterial;
	normalRenderTarget: WebGLRenderTarget;
	ssaoRenderTarget: WebGLRenderTarget;
	blurRenderTarget: WebGLRenderTarget;
	normalMaterial: MeshNormalMaterial;
	blurMaterialNew: ShaderMaterial;
	blurMaterialOld: ShaderMaterial;
	blurMaterial: ShaderMaterial;
	depthRenderMaterial: ShaderMaterial;
	copyMaterial: ShaderMaterial;
	fsQuad: FullScreenQuad;
	originalClearColor: Color = new Color();

	constructor( scene: Scene, camera: PerspectiveCamera, width: number, height: number, kernelSize: number = 45 ) {
		super();
		this.width = ( width !== undefined ) ? width : 512;
		this.height = ( height !== undefined ) ? height : 512;
		this.clear = true;
		this.needsSwap = false;
		this.camera = camera;
		this.scene = scene;
		this.kernelRadius = 8;
		this.kernel = [];
		this.noiseTexture = null;
		this.output = 0;
		this.minDistance = 0.005;
		this.maxDistance = 0.1;
		this.aoPower = 1.5;
    	this.blurScale = 1.0; 
		this.blurSampleCount = 3;
		this._visibilityCache = new Map();
		this.debugMode = false;
		this.mouseDebugMode = false;
		this.mouseUV = new Vector2(0.0, 0.0);
        this.kernelSize = kernelSize;

		window.addEventListener('click', (event) => {
			const x = event.clientX / (event.target as any).width;
			const y = 1.0 - event.clientY / (event.target as any).height;
			this.mouseUV.set(x, y);
			if (this.ssaoMaterial.uniforms['mouseUV'] !== undefined) {
				this.ssaoMaterial.uniforms['mouseUV'].value.set(x, y);
			}
		});

		this.advancedSSAO = new ShaderMaterial({
			defines: Object.assign({}, SSAOShader.defines),
			uniforms: UniformsUtils.clone(SSAOShader.uniforms),
			vertexShader: SSAOShader.vertexShader,
			fragmentShader: SSAOShader.fragmentShader,
			blending: NoBlending
		} );

		this.oldSSAO = new ShaderMaterial({
			defines: Object.assign({}, SSAOShaderOld.defines),
			uniforms: UniformsUtils.clone(SSAOShaderOld.uniforms),
			vertexShader: SSAOShaderOld.vertexShader,
			fragmentShader: SSAOShaderOld.fragmentShader,
			blending: NoBlending
		} );

		this.generateSampleKernel( kernelSize );
		this.loadBlueNoiseTexture();
		// this.generateRandomKernelRotations();

		// depth texture
		const depthTexture = new DepthTexture(this.width, this.height);
		depthTexture.format = DepthStencilFormat;
		depthTexture.type = UnsignedInt248Type;

		// normal render target with depth buffer
		this.normalRenderTarget = new WebGLRenderTarget( this.width, this.height, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			depthTexture: depthTexture
		} );

		// ssao render target
		this.ssaoRenderTarget = new WebGLRenderTarget( this.width, this.height, { type: HalfFloatType } );
		this.blurRenderTarget = this.ssaoRenderTarget.clone();
		this.ssaoMaterial = this.advancedSSAO;
		this.minDistance = 1.0;
		this.maxDistance = 8.0;

		this.ssaoMaterial.uniforms['debugMode'] = { value: false };
		this.ssaoMaterial.uniforms['mouseDebugMode'] = { value: false };
		this.ssaoMaterial.defines[ 'KERNEL_SIZE' ] = kernelSize;

		this.ssaoMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
		this.ssaoMaterial.uniforms[ 'tDepth' ].value = this.normalRenderTarget.depthTexture;
		this.ssaoMaterial.uniforms[ 'kernel' ].value = this.kernel;
		this.ssaoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.ssaoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.ssaoMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
		this.ssaoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssaoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		this.ssaoMaterial.uniforms[ 'cameraPosition' ] = { value: new Vector3() };

		// normal material
		this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

		// blur material
		this.blurMaterialNew = new ShaderMaterial({
			defines: {},
			uniforms: UniformsUtils.clone(SSAOBlurShader.uniforms),
			vertexShader: SSAOBlurShader.vertexShader,
			fragmentShader: SSAOBlurShader.fragmentShader
		});

		this.blurMaterialOld = new ShaderMaterial({
			defines: {},
			uniforms: UniformsUtils.clone(SSAOBlurShaderOld.uniforms),
			vertexShader: SSAOBlurShaderOld.vertexShader,
			fragmentShader: SSAOBlurShaderOld.fragmentShader
		});

		this.blurMaterial = this.blurMaterialOld;
		
		// material for rendering the depth
		this.depthRenderMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SSAODepthShader.defines ),
			uniforms: UniformsUtils.clone( SSAODepthShader.uniforms ),
			vertexShader: SSAODepthShader.vertexShader,
			fragmentShader: SSAODepthShader.fragmentShader,
			blending: NoBlending
		} );
		this.depthRenderMaterial.uniforms[ 'tDepth' ].value = this.normalRenderTarget.depthTexture;
		this.depthRenderMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.depthRenderMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

		// material for rendering the content of a render target
		this.copyMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			transparent: true,
			depthTest: false,
			depthWrite: false,
			blendSrc: DstColorFactor,
			blendDst: ZeroFactor,
			blendEquation: AddEquation,
			blendSrcAlpha: DstAlphaFactor,
			blendDstAlpha: ZeroFactor,
			blendEquationAlpha: AddEquation
		});

		this.fsQuad = new FullScreenQuad( undefined );
		this.originalClearColor = new Color();
	}

	setKernelSize(size: number) {
		this.kernelSize = size;
		localStorage.setItem('kernelSize', size.toString());  // Save the value in localStorage

		// Regenerate the kernel and apply it dynamically without reloading the page
		this.generateSampleKernel(size);  // Regenerate the kernel with the new size
		if (this.ssaoMaterial.uniforms['kernel'] !== undefined) {
			this.ssaoMaterial.uniforms['kernel'].value = this.kernel;
		}
		if (this.ssaoMaterial.defines['KERNEL_SIZE'] !== undefined) {
			this.ssaoMaterial.defines['KERNEL_SIZE'] = size;
		}
		this.ssaoMaterial.needsUpdate = true;  // Force the material to update
	}

	setBlurShader(type: 'Blur New' | 'Blur Old') {
		if (type === 'Blur New') {
			this.blurMaterial = this.blurMaterialNew;
		} else if (type === 'Blur Old') {
			this.blurMaterial = this.blurMaterialOld;
		}
	}

	setShader(type: 'Advanced' | 'SSAO Old') {
		if (type === 'Advanced') {
			this.ssaoMaterial = this.advancedSSAO;
			this.minDistance = 1.0;
			this.maxDistance = 8.0;
		} else if (type === 'SSAO Old') {
			this.ssaoMaterial = this.oldSSAO;
			this.minDistance = 0.005;
			this.maxDistance = 0.1;
		}
	}
	
	setAOPower(power: number) {
		this.aoPower = power;
	}
	
	setBlurScale(scale: number) {
		this.blurScale = scale;
	}
	
	setBlurSampleCount(sampleCount: number) {
		this.blurSampleCount = sampleCount;
  	}

	dispose() {

		// dispose render targets
		this.normalRenderTarget.dispose();
		this.ssaoRenderTarget.dispose();
		this.blurRenderTarget.dispose();

		// dispose materials
		this.normalMaterial.dispose();
		this.blurMaterial.dispose();
		this.copyMaterial.dispose();
		this.depthRenderMaterial.dispose();

		// dipsose full screen quad
		this.fsQuad.dispose();

	}

	loadBlueNoiseTexture() {
		const loader = new TextureLoader();
	
		// Load your blue noise texture
		loader.load(
			'./img/blueNoise.png',
			(texture) => {
				// Set texture properties
				texture.wrapS = RepeatWrapping;
				texture.wrapT = RepeatWrapping;
				texture.magFilter = NearestFilter;
				texture.minFilter = NearestFilter;
				this.noiseTexture = texture; // Assign the loaded texture to SSAO shader uniform
				this.ssaoMaterial.uniforms['tNoise'].value = this.noiseTexture;
				if (this.blurMaterial?.uniforms?.['tNoise']) {
					this.blurMaterial.uniforms['tNoise'].value = this.noiseTexture;
				}
	
				console.log('Blue noise texture loaded:', texture);
			},
			undefined, // Progress callback (optional)
			(error) => {
				// Log an error if the texture fails to load
				console.error('Failed to load blue noise texture:', error);
			}
		);
	}
	

	render(
		renderer: WebGLRenderer,
		_writeBuffer: WebGLRenderTarget,
		readBuffer: WebGLRenderTarget
	  	): void {
		// render normals and depth (honor only meshes, points and lines do not contribute to SSAO)

		this.camera.updateMatrixWorld( true );
   		this.camera.updateProjectionMatrix();

		// Rebind the camera matrices to the SSAO shader uniforms
		this.ssaoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.ssaoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.ssaoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssaoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		if (this.ssaoMaterial.uniforms['cameraInverseViewMatrix']) {
			this.ssaoMaterial.uniforms['cameraInverseViewMatrix'].value.copy(this.camera.matrixWorld);
		}
		if (this.ssaoMaterial.uniforms['cameraViewMatrix']) {
			this.ssaoMaterial.uniforms['cameraViewMatrix'].value.copy(this.camera.matrixWorldInverse);
		}

		if (this.ssaoMaterial.uniforms['kernelSize'] !== undefined) {
			this.ssaoMaterial.uniforms['kernelSize'].value = this.kernelSize;
		}

		this.ssaoMaterial.uniforms[ 'resolution' ].value.set( this.width, this.height );
		// render normals and depth (honor only meshes, points, and lines do not contribute to SSAO)

		this.overrideVisibility();
		this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );
		this.restoreVisibility();

		// render AO
		if (this.ssaoMaterial.uniforms['aoPower']) {
			this.ssaoMaterial.uniforms['aoPower'].value = this.aoPower;
		}
		this.ssaoMaterial.uniforms[ 'kernelRadius' ].value = this.kernelRadius;
		this.ssaoMaterial.uniforms[ 'minDistance' ].value = this.minDistance;
		this.ssaoMaterial.uniforms[ 'maxDistance' ].value = this.maxDistance;
		if (this.ssaoMaterial.uniforms['tDiffuse']) {
			this.ssaoMaterial.uniforms['tDiffuse'].value = readBuffer.texture;
		}
		
		this.ssaoMaterial.uniforms[ 'tDepth' ].value = this.normalRenderTarget.depthTexture;

		if (this.ssaoMaterial.uniforms['debugMode']) {
			this.ssaoMaterial.uniforms['debugMode'].value = this.debugMode ? 1 : 0;
		}
		if (this.ssaoMaterial.uniforms['mouseDebugMode']) {
			this.ssaoMaterial.uniforms['mouseDebugMode'].value = this.mouseDebugMode ? 1 : 0;
		}

		if (this.ssaoMaterial.uniforms[ 'cameraPosition' ]) {
			this.ssaoMaterial.uniforms[ 'cameraPosition' ].value.copy( this.camera.position );
		}

		this.ssaoMaterial.uniforms['kernel'].value = this.kernel;
		if (this.ssaoMaterial.uniforms['globalNoise']) {
			const jitter = (this.camera as any).jitter??[0,0];
			const jitterScale = 1024.0;
			this.ssaoMaterial.uniforms['globalNoise'].value.set(jitter[0] * jitterScale, jitter[1] * jitterScale);
		}		

		this.renderPass( renderer, this.ssaoMaterial, this.ssaoRenderTarget );

		// render blur
		if (this.blurMaterial.uniforms['blurScale']) {
			this.blurMaterial.uniforms['blurScale'].value = this.blurScale;
			this.blurMaterial.uniforms['blurSampleCount'].value = this.blurSampleCount;
		}
				
		if (this.blurMaterial.uniforms['tDiffuse']) {
			this.blurMaterial.uniforms['tDiffuse'].value = this.ssaoRenderTarget.texture;
		}

		this.blurMaterial.uniforms['resolution'].value.set( this.width, this.height );
		if (this.blurMaterial.uniforms['tNormal']) {
			this.blurMaterial.uniforms['tNormal'].value = this.normalRenderTarget.texture;
		}

		if (this.output == SSAOPass.OUTPUT.Blur || this.output == SSAOPass.OUTPUT.DefaultBlurred) {
			this.renderPass( renderer, this.blurMaterial, this.blurRenderTarget );
		}

		const outputRT = (this.renderToScreen ? undefined : readBuffer) as WebGLRenderTarget;

		// output result to screen
		switch ( this.output ) {

			case SSAOPass.OUTPUT.SSAO:
				this.copyMaterial.uniforms['tDiffuse'].value = this.ssaoRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass(renderer,this.copyMaterial,outputRT);
				break;

			case SSAOPass.OUTPUT.Blur:
				this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass(renderer,this.copyMaterial,outputRT);
				break;

			case SSAOPass.OUTPUT.Depth:
				this.renderPass(renderer,this.depthRenderMaterial,outputRT);
				break;

			case SSAOPass.OUTPUT.Normal:
				this.copyMaterial.uniforms['tDiffuse'].value = this.normalRenderTarget.texture;
				this.copyMaterial.blending = NoBlending;
				this.renderPass(renderer,this.copyMaterial,outputRT);
				break;

			case SSAOPass.OUTPUT.Default:
				this.copyMaterial.uniforms['tDiffuse'].value = this.ssaoRenderTarget.texture;
				this.copyMaterial.blending = CustomBlending;
				this.renderPass(renderer,this.copyMaterial,outputRT);
				break;

			case SSAOPass.OUTPUT.DefaultBlurred:
				this.copyMaterial.uniforms['tDiffuse'].value = this.blurRenderTarget.texture;
				this.copyMaterial.blending = CustomBlending;
				this.renderPass(renderer,this.copyMaterial,outputRT);
				break;
	
			default:
				console.warn( 'THREE.SSAOPass: Unknown output type.' );
		}

	}

	renderPass(
		renderer: WebGLRenderer,
		passMaterial: Material,
		renderTarget: WebGLRenderTarget,
		clearColor?: Color | number,
		clearAlpha?: number
	  ): void {

		// save original state
		renderer.getClearColor( this.originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );

		// setup pass state
		renderer.autoClear = false;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.fsQuad.material = passMaterial;
		this.fsQuad.render( renderer );

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}


	renderOverride(
		renderer: WebGLRenderer,
		overrideMaterial: Material,
		renderTarget: WebGLRenderTarget,
		clearColor?: Color | number,
		clearAlpha?: number
	  ): void {

		renderer.getClearColor( this.originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.overrideMaterial = overrideMaterial;
		renderer.render( this.scene, this.camera );
		this.scene.overrideMaterial = null;

		// restore original state

		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this.originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	setSize( width: number, height: number ) {

		this.width = width;
		this.height = height;

		this.ssaoRenderTarget.setSize( width, height );
		this.normalRenderTarget.setSize( width, height );
		this.blurRenderTarget.setSize( width, height );

		this.ssaoMaterial.uniforms[ 'resolution' ].value.set( width, height );
		this.ssaoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.ssaoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		if (this.ssaoMaterial.uniforms['cameraInverseViewMatrix']) {
			this.ssaoMaterial.uniforms['cameraInverseViewMatrix'].value.copy(this.camera.matrixWorld);
		}
		if (this.ssaoMaterial.uniforms['cameraViewMatrix']) {
			this.ssaoMaterial.uniforms['cameraViewMatrix'].value.copy(this.camera.matrixWorldInverse);
		}
	}

	generateSampleKernel( kernelSize: number ) {

		this.kernel.splice(0, this.kernel.length);
		const kernel = this.kernel;

		for ( let i = 0; i < kernelSize; i ++ ) {

			const sample = new Vector3();
			const u1 = Math.random();
			const u2 = Math.random();

			const r = Math.sqrt(u1);
			const theta = 2 * Math.PI * u2;

			sample.x = r * Math.cos(theta);
			sample.y = r * Math.sin(theta);
			sample.z = Math.sqrt(1 - u1);

			// Scale must not be 0
			let scale = (i + 1) / kernelSize;
			scale = Math.pow( scale, 2 );
			sample.multiplyScalar( scale );

			kernel.push( sample );

		}

	}

	generateRandomKernelRotations() {

		const width = 4, height = 4;

		const noiseGenerator = new ImprovedNoise();

		const size = width * height;
		const data = new Float32Array( size );

		for ( let i = 0; i < size; i ++ ) {

			const x = Math.random() * 100; // Larger scale for better texture generation
			const y = Math.random() * 100;
			const z = 0;

			// Generate Perlin noise using ImprovedNoise for each point
			data[ i ] = noiseGenerator.noise( x, y, z );

		}

		// Creating the noise texture
		this.noiseTexture = new DataTexture( data, width, height, RedFormat, FloatType );
		this.noiseTexture.wrapS = RepeatWrapping;
		this.noiseTexture.wrapT = RepeatWrapping;
		this.noiseTexture.needsUpdate = true;

	}

	overrideVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;

		scene.traverse( function ( object ) {

			cache.set( object, object.visible );

			if (object instanceof Points || object instanceof Line) {
				object.visible = false;
			}

		} );

	}

	restoreVisibility() {

		const scene = this.scene;
		const cache = this._visibilityCache;

		scene.traverse( function ( object ) {

			const visible = cache.get( object );
			if (visible !== undefined) {
				object.visible = visible;
			  }

		} );

		cache.clear();

	}

}

SSAOPass.OUTPUT = {
	'Default': 0,
	'SSAO': 1,
	'Blur': 2,
	'Depth': 3,
	'Normal': 4,
	'DefaultBlurred': 5
};

export { SSAOPass };