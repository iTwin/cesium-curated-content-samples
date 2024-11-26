import "./style.css";
import * as THREE from "three";
import { getBentleyAuthClient, getCesiumMoonTerrianTiles } from "common";
import { GUI } from "lil-gui";
import { TilesRenderer, LUNAR_ELLIPSOID, GlobeControls  } from "3d-tiles-renderer";


const imsPrefix = import.meta.env.VITE_IMS_PREFIX ?? "qa-";
const iTwinId = import.meta.env.VITE_ITWIN_ID;
const clientId = import.meta.env.VITE_CLIENT_ID;

if (!iTwinId || !clientId) {
  throw new Error("Missing required environment variables");
}

const authClient = await getBentleyAuthClient(clientId, imsPrefix);

const accessToken = await authClient.getAccessToken();
const cesiumMoonTerrianTiles = await getCesiumMoonTerrianTiles(iTwinId, imsPrefix, accessToken);

var camera = {} as THREE.PerspectiveCamera;
var controls = {} as GlobeControls;
var scene = {} as THREE.Scene;
var renderer = {} as THREE.WebGLRenderer;
var tiles = {} as TilesRenderer;

init();
animate();

function reinstantiateTiles() {
	if ( tiles ) {
		scene.remove( tiles.group );
	}

	tiles = new TilesRenderer(cesiumMoonTerrianTiles.url);

	const headers = {
    "Authorization": `Bearer ${cesiumMoonTerrianTiles.accessToken}`
  };

  tiles.fetchOptions = { headers }

	tiles.ellipsoid = LUNAR_ELLIPSOID;
	tiles.group.rotation.x = - Math.PI / 2;
	tiles.errorTarget = 20;
	scene.add( tiles.group );

	tiles.setCamera( camera );
	controls.setTilesRenderer( tiles );
}

function init() {
	// renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0x151c1f );
	document.body.appendChild( renderer.domElement );

	// scene
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 160000000 );
	camera.position.set( 2620409, 0, - 6249816 );
	camera.lookAt( 0, 0, 0 );

	// controls
	controls = new GlobeControls( scene, camera, renderer.domElement, null );
	controls.enableDamping = true;

	// initialize tiles
	reinstantiateTiles();

	onWindowResize();
	window.addEventListener( 'resize', onWindowResize, false );

	// GUI
	const gui = new GUI({width: 300});

	const ionOptions = gui.addFolder( 'Ion' );
	ionOptions.add( {ASSET : "M O O N" }, 'ASSET' );
	ionOptions.open();
}

function onWindowResize() {
	const aspect = window.innerWidth / window.innerHeight;
	camera.aspect = aspect;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
}

function animate() {
	requestAnimationFrame( animate );

	if (!tiles) {
		return;
	};

	controls.update();

	// update options
	tiles.setResolutionFromRenderer( camera, renderer );

	// update tiles
	camera.updateMatrixWorld();
	tiles.update();

	renderer.render( scene, camera );
}