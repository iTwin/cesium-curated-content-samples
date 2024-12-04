# r3f-sample

This is a sample that demonstrates how to view a tileset in the [Cesium 3D Tiles](https://github.com/CesiumGS/3d-tiles) format from the iTwin platform [cesium curated content](https://developer.bentley.com/apis/cesium-curated-content) in [three.js](https://threejs.org/), using [react-three-fiber (r3f)](https://r3f.docs.pmnd.rs/getting-started/introduction). This is done using [3DTilesRendererJS](https://github.com/NASA-AMMOS/3DTilesRendererJS/tree/master), a package that implements a three.js renderer for 3D Tiles. For this sample, the [Cesium OSM Buildings](https://cesium.com/platform/cesium-ion/content/cesium-osm-buildings/) will be rendered.

## Environment variables

In a .env file in the `r3f-sample` directory:

- `VITE_IMS_PREFIX` - Bentley IMS authority prefix (should be "dev-", "qa-", or "") (optional, default is "qa-")
- `VITE_CLIENT_ID` - Client ID needed to sign in with Bentley IMS (required)
- `VITE_ITWIN_ID` - iTwin Id of an iTwin. You will need to have permission to read this iTwin (optional, if no Id is provided the user's primary account iTwin will be used)

### Example

```
VITE_CLIENT_ID="**YOUR CLIENT ID**"
VITE_IMS_PREFIX ="qa-"
VITE_ITWIN_ID="**OPTIONAL ITWIN ID**"
```

## Steps to run

In the root directory:

```bash
pnpm install
pnpm build
cd r3f-sample
npm run dev
```

- Navigate in your browser to https://localhost:8080
