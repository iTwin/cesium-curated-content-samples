/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

export class BentleyCesiumCuratedContentPlugin {
  constructor( {  accessToken, itwinId, imsPrefix } ) {
    this.name = 'BENTLEY_CESIUM_CONTENT';
    this.tiles = null;
    this.endpointURL = null;

    this.accessToken = accessToken;
    this.itwinId = itwinId
    this.imsPrefix = imsPrefix

    this._bearerToken = null;
    this._tileSetVersion = - 1;
    this._tokenRefreshPromise = null;
    this._attributions = [];
  }

  init(tiles) {
    tiles.rootURL = `https://${this.imsPrefix}api.bentley.com/curated-content/cesium/96188/tiles?iTwinId=${this.itwinId}`;

    this.tiles = tiles;
    this.endpointURL = tiles.rootURL;
  }

  loadRootTileSet() {
    // ensure we have an up-to-date token and root url, then trigger the internal
    // root tile set load function
    return this._refreshToken()
      .then( () => this.tiles.loadRootTileSet() );
  }

  preprocessURL(uri) {
    uri = new URL(uri);
    
    if (/^http/.test(uri.protocol) && this._tileSetVersion != - 1) {
      uri.searchParams.append( 'v', this._tileSetVersion );
    }

    return uri.toString();
  }

  fetchData( uri, options ) {
    return Promise.resolve().then( async () => {
      // wait for the token to refresh if loading
      if ( this._tokenRefreshPromise !== null ) {
        await this._tokenRefreshPromise;
        uri = this.preprocessURL( uri );
      }

      const res = await fetch( uri, options );
      if ( res.status >= 400 && res.status <= 499 && this.autoRefreshToken ) {
        await this._refreshToken( options );
        return fetch( this.preprocessURL( uri ), options );
      } else {
        return res;
      }
    });
  }

  getAttributions( target ) {
    if ( this.tiles.visibleTiles.size > 0 ) {
      target.push( ...this._attributions );
    }
  }

  _refreshToken( options ) {
    if ( this._tokenRefreshPromise === null || this.accessToken == null ) {
      // construct the url to fetch the endpoint
      const url = new URL( this.endpointURL );

      const headers = {
        "Authorization": `${this.accessToken}`
      };    
      options = { headers }

      this._tokenRefreshPromise = fetch(url, options)
        .then( res => {
          if ( !res.ok) {
            throw new Error( `Bentley Cesium Auth Plugin: Failed to load data with error code ${ res.status }` );
          }

          return res.json();
        })
        .then( json => {
          const tiles = this.tiles;

          tiles.rootURL = json.url;
          tiles.fetchOptions.headers = tiles.fetchOptions.headers || {};
          tiles.fetchOptions.headers.Authorization = `Bearer ${ json.accessToken }`;

          // save the version key if present
          if ( url.searchParams.has( 'v' ) && this._tileSetVersion === - 1 ) {
            const url = new URL( json.url );
            this._tileSetVersion = url.searchParams.get( 'v' );
          }

          this._bearerToken = json.accessToken;
          if (json.attributions) {
            this._attributions = json.attributions.map(att => ({
              value: att.html,
              type: 'html',
              collapsible: att.collapsible,
            }));
          }

        this._tokenRefreshPromise = null;

        return json;
        });
    }

    return this._tokenRefreshPromise;
  }
}
