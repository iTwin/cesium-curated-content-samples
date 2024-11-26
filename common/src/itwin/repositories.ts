export async function fetchRepositories(accessToken: string, imsPrefix: string, iTwinId: string) {

  const headers = {
    "Authorization": accessToken,
    "Content-Type": "application/json",
  };
  
  let url = `https://${imsPrefix}connect-contextregistry.bentley.com/v1/itwins/${iTwinId}/repositories/resources`;
  try {
    const response = await fetch(url, {headers});
    const result = await response.json();
    console.log(result);
    return result;
  }
  catch {
    return undefined;
  }
}

export async function fetchResource(accessToken: string, imsPrefix: string, detailsUrl: string) {
  const resourceDetailsUrl = detailsUrl.replace(`${imsPrefix}api.bentley.com`, `${imsPrefix}connect-contextregistry.bentley.com/v1`);

  const headers = {
    Authorization: accessToken
  };
  
  try {
    const response = await fetch(resourceDetailsUrl, { headers });
    const result = JSON.parse(JSON.stringify(await response.json()));
    const tilesetUrl = result.graphics.url;
    const graphicsType = result.graphics.type;
    const accessToken = result.graphics.accessToken;

    return { tilesetUrl, graphicsType, accessToken };
  } catch (err) {
    return undefined;
  }
}

