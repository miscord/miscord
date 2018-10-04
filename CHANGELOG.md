# Changelog

## [4.0.0] - 2018-10-04
### Added
- Facebook message on attachments for Discord larger than 8MB
- Discord message when Messenger failed

### Changed
- `facebook-chat-api` -> `libfb`

## [3.12.2] - 2018-09-26
### Changed
- Fixed file downloading for more than 2 linked chats

## [3.12.1] - 2018-09-25
### Added
- New method of uploading images to Facebook

## [3.12.0] - 2018-09-19
### Changed
- Logger: `npmlog` -> `consola`

## [3.11.4] - 2018-09-18
### Added
- Missing space to `and X more...`

### Changed
- Moved API to @miscord/facebook

## [3.11.3] - 2018-09-16
### Changed
- Fixed incorrect import
- Moved info from README to wiki

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