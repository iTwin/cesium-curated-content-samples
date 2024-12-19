# r3f-sample

This is a sample that demonstrates how to view a tileset in the [Cesium 3D Tiles](https://github.com/CesiumGS/3d-tiles) format from the iTwin platform [cesium curated content](https://developer.bentley.com/apis/cesium-curated-content) in [three.js](https://threejs.org/), using [react-three-fiber (r3f)](https://r3f.docs.pmnd.rs/getting-started/introduction). This is done using [3DTilesRendererJS](https://github.com/NASA-AMMOS/3DTilesRendererJS/tree/master), a package that implements a three.js renderer for 3D Tiles. For this sample, the [Cesium OSM Buildings](https://cesium.com/platform/cesium-ion/content/cesium-osm-buildings/) will be rendered.

The Cesium Curated Content is an API available through the [iTwin Platform](https://developer.bentley.com/).

## Environment variables

In a .env file in the `r3f-sample` directory:

- `VITE_CLIENT_ID` - SPA Application Client ID needed to sign in with Bentley IMS (required)
- `VITE_IMS_PREFIX` - Bentley IMS authority prefix (optional)

For an example of the `.env` file, an one has been provided [here](./.env.example)

## Authentication

This samples uses the [@itwin/auth-clients](https://github.com/iTwin/auth-clients) package to handle authentication. It requires a SPA Application to be registered on the iTwin Platform. This can be done [here](https://developer.bentley.com/my-apps/) (click the "+ Register Now" button in the top right). During registration `http://localhost:8080` should be added to the list of valid Redirect URIs.

The environment variable `VITE_CLIENT_ID` should be set to the client id of this newly registered SPA Application.

## Steps to run

In the root directory:

```bash
pnpm install
pnpm build
cd r3f-sample
pnpm dev
```
