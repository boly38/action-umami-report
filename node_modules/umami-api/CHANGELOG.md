# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2022-07-15

This release contains a LOT of breaking changes. Also a lot of new stuff!

### Added

- `static UmamiAPIClient.collect(...)` – Collect pageviews and events without initializing a client.
- `setDefaultUnit(...)` – Set the default unit of time when getting pageviews or events.
- `setDefaultTZ(...)` – Set the default timezone when getting pageviews or events.
- `setDefaultMetricType(...)` – Set the default type when getting metrics.
- `setDefaultUserAgent(...)` – Set the default user agent when calling `collect(...)` on an instance. Does **not** affect the new static method.
- `getWebsiteBy(...)` – Replaces part of the functionality of `getWebsite(...)`.

### Changed

- [BREAKING] Authentication is done directly in the constructor now.
- [BREAKING] There previously were 2 classes, now there is only one.
- [BREAKING] Rename `getPageViews(...)` to `getPageviews(...)`
- [BREAKING] The `period` parameter is now in the options, to make it optional. This affects `getStats(...)`, `getPageviews(...)`, `getEvents(...)`, `getEventsBy(...)` and `getMetrics(...)`.
- [BREAKING] The `getWebsite(...)` function was split.
- Better error messages

### Removed

- `getDefaultPeriod(...)` as it's unnecessary.

## [0.1.5] - 2022-07-15

### Changed

- Remove explicit return type in `auth(...)` function.

## [0.1.4] - 2022-07-15

### Added

- **Lots** of JSDoc comments. Not everything is done or typed yet however, especially the new stuff.
- The authentication token gets checked about every hour.
- `setDefaultPeriod(...)` and `getDefaultPeriod()` – Set and get the default time period. Defaults to `24h`.
- `getCurrentUser()` – Get the currently logged in user's info.
- `updateWebsite(...)` – Update a website's name, domain or enable the share URL.
- `getWebsite(...)` – Get a single website, either by specifying a property it has, its ID, or nothing (returns the first website in the list).
- `resetWebsite(...)` – Reset a website by ID.
- `deleteWebsite(...)` – Delete a website by ID.
- `getEventsBy(...)` – Get the total number of events in a time period, filtered by their value or their type.
- `getActiveVisitors(...)` – Get the number of active visitors.
- `getActiveVisitors(...)` – Get the number of active visitors.
- [**Admin only**] `getAccounts(...)` – Get all of the user accounts

## [0.1.4] - 2022-07-14

### Added

- **Lots** of JSDoc comments. Not everything is done or typed yet however, especially the new stuff.
- The authentication token gets checked about every hour.
- `setDefaultPeriod(...)` and `getDefaultPeriod()` – Set and get the default time period. Defaults to `24h`.
- `getCurrentUser()` – Get the currently logged in user's info.
- `updateWebsite(...)` – Update a website's name, domain or enable the share URL.
- `getWebsite(...)` – Get a single website, either by specifying a property it has, its ID, or nothing (returns the first website in the list).
- `resetWebsite(...)` – Reset a website by ID.
- `deleteWebsite(...)` – Delete a website by ID.
- `getEventsBy(...)` – Get the total number of events in a time period, filtered by their value or their type.
- `getActiveVisitors(...)` – Get the number of active visitors.
- `getActiveVisitors(...)` – Get the number of active visitors.
- [**Admin only**] `getAccounts(...)` – Get all of the user accounts

## [0.1.3] - 2022-07-14

### Changed

- Fix package name in README.

## [0.1.2] - 2022-07-14

### Changed

- Fix README instructions.

## [0.1.1] - 2022-07-14

### Fixed

- Fix `collect(...)` function. It was pointing to the wrong endpoint and needed a "User-Agent" header.

## [0.1.0] - 2022-07-14

### Added

- Initial release
