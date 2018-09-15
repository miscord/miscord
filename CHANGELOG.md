# Changelog

## [3.11.2] - 2018-09-15
### Changed
- Replaced facebook-chat-api with @bjornskjald/facebook-chat-api

## [3.11.1] - 2018-09-15
### Added
- Truncating people in plans

### Removed
- "Invited" people in plans

## [3.11.0] - 2018-09-15
### Added
- Timestamps in the logs/console
- Showing plans
- `timezone` field in the config (for plan time)

### Changed
- `messenger.filter.whitelist` -> `messenger.whitelist`

### Removed
- `messenger.filter.blacklist`

## [3.10.0] - 2018-09-09
### Added
- Read-only channels
- Commands: `eval`, `info`, `add`, `remove`
- Hiding automatically created channels for non-admins

### Changed
- Renamed channels.yml to connections.yml
- Changed format of connections.yml
- Commands: `link`, `unlink`

## [3.9.3] - 2018-09-05
### Added
- Truncating message when exceeds 2000 chars on Discord

## [3.9.2] - 2018-09-05
### Changed
- Fixed quit command
- Fixed building script

## [3.9.1] - 2018-09-03
### Changed
- Fixed crash on start when category is set in the config

### Removed
- Unused shrinkwrap.yaml file

## [3.9.0] - 2018-09-02
### Added
- Changelog
- New build script

### Changed
- Made m!keep case insensitive
- createChannels' default value is now false
- checkUpdates' default value is now false
- Updated dependencies

### Removed
- Env config
- Env directory