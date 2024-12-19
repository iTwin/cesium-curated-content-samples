/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import {
    TilesPlugin,
    TilesRenderer,
    GlobeControls,
    CameraTransition,
    TilesAttributionOverlay     
} from '3d-tiles-renderer/r3f';
import { BentleyCesiumCuratedContentPlugin } from './plugins/BentleyCesiumCuratedContentPlugin';
import { Canvas } from '@react-three/fiber';
import { Environment  } from '@react-three/drei';
 
export function Globe ({ accessToken, imsPrefix }) {
  return (
    <Canvas
      frameloop='demand'
      camera={ {
        position: [ 286.5, 889, 1000.0 ],
      }
      }
      style={ {
        width: '100%',
        height: '100%',
        position: 'absolute',
        margin: 0,
        left: 0,
        top: 0,
      } }
      flat
    >
      <color attach="background" args={["#241100"]} />

      <TilesRenderer key={accessToken} group={ { rotation: [ - Math.PI / 2, 0, 0 ] } }>
        <TilesPlugin plugin={ BentleyCesiumCuratedContentPlugin } args={ {accessToken, imsPrefix} } />
        <GlobeControls enableDamping={ true } />
        <TilesAttributionOverlay />
      </TilesRenderer>
      
      <Environment
          preset="city"
          backgroundBlurriness={ 0.9 }
          environmentIntensity={ 1 }
      />

      <CameraTransition mode={ 'orthographic' }/>
    </Canvas>
  ); 
}
