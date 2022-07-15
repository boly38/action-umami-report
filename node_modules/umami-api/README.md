# Umami API Client

## Installation

```shell
npm install umami-api
```

## Usage

There are two ways to use this module:

### Unauthenticated (`/api/collect` only)

```ts
import UmamiAPI from "./UmamiAPI";

const umami = new UmamiAPI("stats.example.com");

umami.collect("pageview", {
	website: "e92f5bba-4f05-604c-46c0-a42d618fdc9d",
	url: "/",
	hostname: "example.com",
});
```

### Authenticated (all endpoints)

Creating a new website and accessing its data

```ts
import UmamiAPI from "./UmamiAPI";

const umami = new UmamiAPI("stats.example.com").auth("username", "password");

const newWebsite = umami.createWebsite({
	domain: "test.com",
	name: "test.com",
	enable_share_url: false,
	public: false,
});

const websites = umami.getWebsites();
const pageviews = umami.getPageViews(newWebsite.website_id);
const metrics = umami.getMetrics(newWebsite.website_id);
umami.collect("pageview", {
	website: newWebsite.website_uuid,
	url: "/",
	hostname: newWebsite.domain,
});
```
