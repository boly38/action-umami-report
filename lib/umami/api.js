import fetch from 'node-fetch';
import querystring from 'node:querystring';

// DEV debug
const DEBUG_RESPONSE = process.env.UMAMI_DEBUG_RESPONSE === 'true';
const DEBUG_REQUEST = process.env.UMAMI_DEBUG_REQUEST === 'true';

//~ Utils
const arrayIncludesAllOf = (arr, target) => target.every(v => arr.includes(v));
const isSet = (value) => value !== null && value !== undefined;
const isNotEmptyArray = (value) => isSet(value) && Array.isArray(value) && value.length > 0;
const isUmamiSiteData = (data) => isSet(data) && arrayIncludesAllOf(Object.keys(data), ['website_id', 'website_uuid', 'name', 'domain', 'created_at']);
const givenAuthData = (authData) => {
    if (!isSet(authData) || !isSet(authData.token)) {
      throw "expect valid auth data to query api";
    }
};
const rethrow = (err) => {throw err;}

// Umami API : https://umami.is/docs/api
// TODO : move this util class into a dedicated node-umami-api repository

class UmamiApi {

  static async login(serverUrl, username, password) {
    const authResponse = await fetch(serverUrl+ "/api/auth/login",
        {method: 'POST', body: JSON.stringify({username, password}),
    	   headers: {'Content-Type': 'application/json'}
    	}).catch(rethrow);
    if (authResponse.status != 200) {
      throw "Invalid login"
    }
    const authData = await authResponse.json();
    DEBUG_RESPONSE && console.log(authData);
    return authData;
  }

  static async getSites(serverUrl, authData) {
    givenAuthData(authData);
    const getSitesResponse = await fetch(serverUrl+ "/api/websites",
          { headers: { "Authorization": `Bearer ${authData.token}`} }).catch(rethrow);
    if (getSitesResponse.status != 200) {
      throw "Unable to get sites - " + await getSitesResponse.text();
    }
    const sitesData = await getSitesResponse.json();
    DEBUG_RESPONSE && console.log(sitesData);
    return sitesData;
  }

  static selectSiteByDomain(sitesData, siteDomain = '*first*') {
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

  static async getStats(serverUrl, authData, siteData) {
    givenAuthData(authData);
    if (!isUmamiSiteData(siteData)) {
      throw "Unexpected site data provided";
    }
    const start_at = Date.now()  - (60000 * 60 * 24);
    const end_at = Date.now();
    // const statsUrl = serverUrl+ `/api/website/${siteData.website_id}/stats?start_at=${start_at}&end_at=${end_at}`;
    const statsUrl = serverUrl+ `/api/website/${siteData.website_id}/stats?` + querystring.stringify({ start_at, end_at });
    DEBUG_REQUEST && console.log(statsUrl);
    const getStatsResponse = await fetch(statsUrl,
          { headers: { "Authorization": `Bearer ${authData.token}`} }).catch(rethrow);
    if (getStatsResponse.status != 200) {
      throw `Unable to get stats - ${getStatsResponse.status} - ` + await getStatsResponse.text();
    }
    const sitesStat = await getStatsResponse.json();
    DEBUG_RESPONSE && console.log(sitesStat);
    return sitesStat;
  }

}

export default UmamiApi;