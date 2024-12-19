/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

export async function getCuratedCesiumContent(imsPrefix: string, accessToken: string) {
  const headers = {
    "Authorization": accessToken,
    "Accept": "application/vnd.bentley.itwin-platform.v1+json",
    "Content-Type": "application/json"
  };

  let url = `https://${imsPrefix}api.bentley.com/curated-content/cesium/`;

  const response = await fetch(url, { headers });
  const responseJson = await response.json();

  return responseJson;
}

export async function getCesiumCuratedContentTiles(contentId: string, imsPrefix: string, accessToken: string) {
  const headers = {
    "Authorization": accessToken,
    "Accept": "application/vnd.bentley.itwin-platform.v1+json",
    "Content-Type": "application/json"
  };

  let url = `https://${imsPrefix}api.bentley.com/curated-content/cesium/${contentId}/tiles`;

  const response = await fetch(url, { headers });
  const responseJson = await response.json();

  return { url: responseJson.url, accessToken: responseJson.accessToken, attributions: responseJson.attributions };
}

export async function getCesiumMoonTerrianTiles(imsPrefix: string, accessToken: string) {
  const headers = {
    "Authorization": accessToken,
    "Accept": "application/vnd.bentley.itwin-platform.v1+json",
    "Content-Type": "application/json"
  };

  let url = `https://${imsPrefix}api.bentley.com/curated-content/cesium/2684829/tiles`;

  const response = await fetch(url, { headers });
  const responseJson = await response.json();

  return { url: responseJson.url, accessToken: responseJson.accessToken, attributions: responseJson.attributions };
}