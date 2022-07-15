# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `UmamiAPI.getWebsite(...)` – Get a single website, either by specifying a property it has, or nothing and getting the first website in the list.
- `UmamiAPI.getEventsBy(...)` – Get the total number of events in a time period, filtered by their value or their type.

### Changes

- [BREAKING] The `period` parameter is now in the options, to make it optional. // TODO

## [0.1.1] - 2022-07-14

### Added

- Fix `UmamiAPI.collect()` function. It was pointing to the wrong endpoint and needed a "User-Agent" header.

## [0.1.0] - 2022-07-14

### Added

- Initial release
