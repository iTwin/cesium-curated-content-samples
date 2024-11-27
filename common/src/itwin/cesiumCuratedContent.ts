export async function getCuratedCesiumContent(iTwinId: string, imsPrefix: string, accessToken: string) {
  const headers = {
      "Authorization": accessToken,
      "Accept": "application/vnd.bentley.itwin-platform.v1+json",
      "Content-Type": "application/json"
  };

  let url = `https://${imsPrefix}api.bentley.com/curated-content/cesium/?iTwinId=${iTwinId}`;

  const response = await fetch(url, { headers });
  const responseJson = await response.json();

  return responseJson;
}

export async function getCesiumCuratedContentTiles(contentId: string, iTwinId: string, imsPrefix: string, accessToken: string) {
  const headers = {
      "Authorization": accessToken,
      "Accept": "application/vnd.bentley.itwin-platform.v1+json",
      "Content-Type": "application/json"
  };

  let url = `https://${imsPrefix}api.bentley.com/curated-content/cesium/${contentId}/tiles?iTwinId=${iTwinId}`;

  const response = await fetch(url, { headers });
  const responseJson = await response.json();

  return { url: responseJson.url, accessToken: responseJson.accessToken };
}

export async function getCesiumMoonTerrianTiles(iTwinId: string, imsPrefix: string, accessToken: string) {
  const headers = {
      "Authorization": accessToken,
      "Accept": "application/vnd.bentley.itwin-platform.v1+json",
      "Content-Type": "application/json"
  };

  let url = `https://${imsPrefix}api.bentley.com/curated-content/cesium/2684829/tiles?iTwinId=${iTwinId}`;

  const response = await fetch(url, { headers });
  const responseJson = await response.json();

  return { url: responseJson.url, accessToken: responseJson.accessToken, attributions: responseJson.attributions };
}