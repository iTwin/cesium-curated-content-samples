declare module "3d-tiles-renderer/src/index.js" {
  export class GlobeControls {
    constructor(...args: any[]);
    
    setTilesRenderer(any: any): void;
    update(): void;

    enableDamping: boolean;
  }
}