import queryString from 'query-string';
import fetch from 'node-fetch';

const UMAMI_CLIENT_DEBUG = process.env.UMAMI_CLIENT_DEBUG === 'true';
const UMAMI_CLIENT_DEBUG_REQUEST = process.env.UMAMI_CLIENT_DEBUG_REQUEST === 'true';
const UMAMI_CLIENT_DEBUG_RESPONSE = process.env.UMAMI_CLIENT_DEBUG_RESPONSE === 'true';
/**
 * this utility class implement Umami API CLient
 * https://umami.is/docs/api
 **/
class UmamiClient {

  constructor(options = {}) {
    this.server = "server" in options ? options.server : (process.env.UMAMI_SERVER ? process.env.UMAMI_SERVER : null);
    this._assumeUmamiServer();
    UMAMI_CLIENT_DEBUG && console.debug(`UmamiClient - server:${this.apiUrl}`);
  }

  async login(username = process.env.UMAMI_USER, password = process.env.UMAMI_PASSWORD) {
    const authResponse = await fetch(this.server + "/api/auth/login",
        {method: 'POST', body: JSON.stringify({username, password}),
    	   headers: {'Content-Type': 'application/json'}
    	}).catch(rethrow);
    await assumeResponseSuccess(authResponse, "Login failed");
    const authData = await authResponse.json();
    UMAMI_CLIENT_DEBUG_RESPONSE && console.log(authData);
    return authData;
  }

  async getSites(authData) {
    givenAuthData(authData);
    const getSitesResponse = await fetch(this.server + "/api/websites",
          { headers: { "Authorization": `Bearer ${authData.token}`} }).catch(rethrow);
    await assumeResponseSuccess(getSitesResponse, "Unable to get sites");
    const sitesData = await getSitesResponse.json();
    UMAMI_CLIENT_DEBUG_RESPONSE && console.log(sitesData);
    return sitesData;
  }

  selectSiteByDomain(sitesData, siteDomain = '*first*') {
    if (!isNotEmptyArray(sitesData)) {
      throw "No sites data provided";
    }
    if (!isUmamiSiteData(sitesData[0])) {
      throw "Unexpected sites data provided";
    }
    if (siteDomain === '*first*') {
      return sitesData[0];
    }
    return sitesData.find( d => d.domain === siteDomain );
  }

  async getStatsForLast24h(authData, siteData) {
    givenAuthData(authData);
    if (!isUmamiSiteData(siteData)) {
      throw "Unexpected site data provided";
    }
    const start_at = Date.now()  - (60000 * 60 * 24);// now - 24h
    const end_at = Date.now();
    // const statsUrl = this.server+ `/api/website/${siteData.website_id}/stats?start_at=${start_at}&end_at=${end_at}`;
    const statsUrl = this.server+ `/api/website/${siteData.website_id}/stats?` + queryString.stringify({ start_at, end_at });
    UMAMI_CLIENT_DEBUG_REQUEST && console.log(statsUrl);
    const getStatsResponse = await fetch(statsUrl, { headers: { "Authorization": `Bearer ${authData.token}`} }).catch(rethrow);
    await assumeResponseSuccess(getStatsResponse, "Unable to get site stats");
    const sitesStat = await getStatsResponse.json();
    UMAMI_CLIENT_DEBUG_RESPONSE && console.log(sitesStat);
    return sitesStat;
  }

  _assumeUmamiServer() {
    if (!isSet(this.server)) {
      throw "server is required. ie. set UMAMI_SERVER environment variable or option.";
    }
  }
}

export default UmamiClient;

//~ private
const isSet = (value) => value !== null && value !== undefined;
const isNotEmptyArray = (value) => isSet(value) && Array.isArray(value) && value.length > 0;
const arrayIncludesAllOf = (arr, target) => target.every(v => arr.includes(v));
const isUmamiSiteData = (data) => isSet(data) && arrayIncludesAllOf(Object.keys(data), ['website_id', 'website_uuid', 'name', 'domain', 'created_at']);
const rethrow = (err) => {throw err;}
const assumeResponseSuccess = async function (response, errorMsg) {
  if (response.status < 200 || response.status > 299) {
    throw `${response.status} - ${errorMsg} - ` + await response.text();
  }
}
const givenAuthData = (authData) => {
    if (!isSet(authData) || !isSet(authData.token)) {
      throw "expect valid auth data to query api";
    }
};