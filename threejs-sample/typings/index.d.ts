
/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { TilesRenderer, LUNAR_ELLIPSOID  } from "3d-tiles-renderer";

declare module "3d-tiles-renderer" {
  export class GlobeControls {
    constructor(...args: any[]);
    
    setTilesRenderer(any: any): void;
    update(): void;

    enableDamping: boolean;
  }

  export class TilesRenererer extends TilesRenderer {}
  export const LUNAR_ELLIPSOID;
}