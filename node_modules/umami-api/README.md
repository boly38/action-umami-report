# Umami API Client

🍙 Simple, tiny (<2.5kB gzipped), API client for Umami analytics.

## Installation

```shell
npm install umami-api
```

## Usage

```ts
import UmamiAPIClient from "umami-api";

const umami = new UmamiAPIClient("stats.example.com", "username", "password");

const newWebsite = await umami.createWebsite({
	domain: "test.com",
	name: "test.com",
	enable_share_url: false,
});

const pageviews = await umami.getPageviews(newWebsite.website_id);
const metrics = await umami.getMetrics(newWebsite.website_id);
```
