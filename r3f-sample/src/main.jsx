/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Globe } from './globe';
import { getBentleyAuthClient } from "common";
import {  ITwinsAccessClient } from "@itwin/itwins-client";

const imsPrefix = import.meta.env.VITE_IMS_PREFIX ?? "qa-";
const clientId = import.meta.env.VITE_CLIENT_ID;

function App() {
  const [accessToken, setAccessToken] = useState('');
  const [itwinId, setItwinId] = useState(import.meta.env.VITE_ITWIN_ID);

  useEffect( () => {
    const fetchAccessToken = async () => {
        const authClient = await getBentleyAuthClient(clientId, imsPrefix);
        const accessToken = await authClient.getAccessToken();

        setAccessToken(accessToken);
    };

    fetchAccessToken();
  }, [] );

  useEffect( () => {
    const fetchiTwinId = async () => {
      if(accessToken && !itwinId) {
        const iTwinsAccessClient = new ITwinsAccessClient(`https://${imsPrefix}api.bentley.com/itwins`);
        const iTwinsResponse = await iTwinsAccessClient.getPrimaryAccountAsync(accessToken);

        setItwinId(iTwinsResponse.data?.id);
      }
    }

    fetchiTwinId();		
  }, [accessToken] );

  if (!accessToken || !itwinId) {
    return <div>Loggin' in...</div>;
  }

  return <Globe accessToken={accessToken} itwinId={itwinId} imsPrefix={imsPrefix}/>;
}

createRoot( document.getElementById( 'root' ) ).render(
  <StrictMode>
    <App />
  </StrictMode>,
);