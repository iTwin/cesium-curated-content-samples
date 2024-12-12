# Cesium Curated Content Samples

This repository contains samples for how to use the [Cesium Curated Content](https://developer.bentley.com/apis/cesium-curated-content/) REST API to view [Cesium 3D Tiles](https://github.com/CesiumGS/3d-tiles). The Cesium Curated Content is an API available through the [iTwin Platform](https://developer.bentley.com/).

- [Visualizing Cesium Moon Terrain using Three.js](threejs-sample)
- [Visualizing Cesium OSM Buildings using Three.js and react-three-fiber](r3f-sample)

## Set up

The samples each have a README with details about how to run them and any necessary environment variables. To set up the repository the first time:

- Clone the repository
- Install pnpm v9 using [corepack](https://pnpm.io/installation#using-corepack): `corepack enable pnpm` (or another method)
- `pnpm install` at the root to install all packages
- `pnpm build` to build all packages
