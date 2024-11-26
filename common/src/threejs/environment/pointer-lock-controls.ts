import * as THREE from "three";

export class PointerLockControls {
	private eventListeners: { [key: string]: Function[] } = { "change": [] };
	private keyState: { [key: string]: boolean } = {};
	private enabled: boolean = true;
	private movement: THREE.Vector2 = new THREE.Vector2(0, 0);
	private canvas: HTMLCanvasElement | null = null;
	private zoomSpeed: number = 1.0;
	private direction: THREE.Vector3 = new THREE.Vector3();

	constructor(private camera: THREE.PerspectiveCamera) {
		document.addEventListener('keydown', this.onKeyDown.bind(this), false);
		document.addEventListener('keyup', this.onKeyUp.bind(this), false);
		document.addEventListener('mousemove', this.onMouseMove.bind(this), false);
		document.addEventListener('wheel', this.onMouseWheel.bind(this), false);
	}

	private onMouseMove(event: MouseEvent): void {
		if (!this.enabled) return;

		if (event.buttons !== 1) {
			return;
		}

		if (!(event.target instanceof HTMLCanvasElement)) {
			return;
		}

		this.canvas = event.target;

		event.stopPropagation();

		const movementX = event.movementX || 0;
		const movementY = event.movementY || 0;

		this.movement.x += movementX;
		this.movement.y += movementY;

		this.eventListeners['change'].forEach((listener) => listener());
	}

	private updateCameraRotation(blending: number): boolean {
		if (!this.canvas) {
			return false;
		}

		const mov = this.movement.clone();

		if (mov.length() < 0.05) {
			return false;
		}

		mov.multiplyScalar(blending);
		this.movement.multiplyScalar(1.0 - blending);

		const cameraRotationMatrix = new THREE.Matrix4().makeRotationFromEuler(this.camera.rotation);

		const rotationSpeed = 2.0;
		const factor = Math.PI * 2.0 * (this.camera.fov / 180.0) / this.canvas.width;
		const virtualRotationMatrixX = new THREE.Matrix4().makeRotationX(-mov.y * factor * rotationSpeed);
		const virtualRotationMatrixY = new THREE.Matrix4().makeRotationY(-mov.x * factor * rotationSpeed);

		cameraRotationMatrix.multiply(virtualRotationMatrixX);
		virtualRotationMatrixY.multiply(cameraRotationMatrix);

		this.camera.rotation.setFromRotationMatrix(virtualRotationMatrixY);
		return true;
	}

	private updateCameraDisplacement(delta: number, blending: number): boolean {
		const moveSpeed = 20.0 * delta * this.zoomSpeed;

		if (this.keyState['ArrowUp'] || this.keyState['KeyW']) {
			this.direction.z -= moveSpeed;
		}
		if (this.keyState['ArrowLeft'] || this.keyState['KeyA']) {
			this.direction.x -= moveSpeed;
		}
		if (this.keyState['ArrowDown'] || this.keyState['KeyS']) {
			this.direction.z += moveSpeed;
		}
		if (this.keyState['ArrowRight'] || this.keyState['KeyD']) {
			this.direction.x += moveSpeed;
		}
		if (this.keyState['KeyE']) {
			this.direction.y += moveSpeed;
		}
		if (this.keyState['KeyQ']) {
			this.direction.y -= moveSpeed;
		}

		if (this.direction.length() < 0.01) {
			return false;
		}

		const thisFrameDirection = this.direction.clone();

		thisFrameDirection.multiplyScalar(blending);
		this.direction.multiplyScalar(1.0 - blending);

		thisFrameDirection.applyQuaternion(this.camera.quaternion);
		this.camera.position.add(thisFrameDirection);

		return true;
	}

	private onMouseWheel(event: WheelEvent): void {
		if (!this.enabled) return;
		this.zoomSpeed *= event.deltaY < 0 ? 1.1 : 0.9;
	}

	private onKeyDown(event: KeyboardEvent): void {
		if (!this.enabled) return;
		this.keyState[event.code] = true;
	}

	private onKeyUp(event: KeyboardEvent): void {
		if (!this.enabled) return;
		delete this.keyState[event.code];
	}

	public dispose(): void {
		document.removeEventListener('mousemove', this.onMouseMove.bind(this), false);
		document.removeEventListener('keydown', this.onKeyDown.bind(this), false);
		document.removeEventListener('keyup', this.onKeyUp.bind(this), false);
		document.removeEventListener('wheel', this.onMouseWheel.bind(this), false);
	}

	public setSpeed(speed: number): void {
		this.zoomSpeed = speed;
	}

	public addEventListener(type: string, listener: Function): void {
		if (!this.eventListeners[type]) {
			this.eventListeners[type] = [];
		}
		this.eventListeners[type].push(listener);
	}

	public update(delta: number): void {
		if (!this.enabled) return;

		const blending = Math.min(0.50, 30 * delta);

		let changed = this.updateCameraDisplacement(delta, blending);
		if (this.updateCameraRotation(blending)) {
			changed = true;
		}

		if (changed) {
			this.eventListeners['change'].forEach((listener) => listener());
		}
	}
}
