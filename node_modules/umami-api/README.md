# Umami API Client

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/jakobbouchard/umami-api-client/test.yml?branch=main&label=tests&style=flat-square)
![npm](https://img.shields.io/npm/v/umami-api?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/umami-api?style=flat-square)
![npm downloads](https://img.shields.io/npm/dt/umami-api?style=flat-square)

🍙 Simple, tiny API client for Umami analytics.

## Installation

```shell
npm install umami-api
```

## Usage

```ts
import UmamiAPIClient from "umami-api";
```

### Setting default options

Default options can be set with the following environment variables:

- `UMAMI_CLIENT_TIMEOUT_MS`: Axios timeout in milliseconds. Default: `2000`.
- `UMAMI_CLIENT_USER_AGENT`: User agent to use for requests. Default: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:102.0) Gecko/20100101 Firefox/102.0`.
- `UMAMI_CLIENT_TIME_PERIOD`: Default time period for pageviews, events, etc. Default: `24h`.
- `UMAMI_CLIENT_TIME_UNIT`: Default time unit for pageviews, events, etc. Default: `hour`.
- `UMAMI_CLIENT_TIMEZONE`: Default timezone for pageviews, events, etc. Default: `America/Toronto`.
- `UMAMI_CLIENT_METRIC_TYPE`: Default metric type to get. Default: `url`.

## Example

```ts
import UmamiAPIClient from "umami-api";

const umami = new UmamiAPIClient("stats.example.com", "username", "password");

const newWebsite = await umami.createWebsite({
	domain: "test.com",
	name: "test.com",
	enableShareUrl: false,
});

const pageviews = await newWebsite.getPageviews();
const metrics = await newWebsite.getMetrics();
```
