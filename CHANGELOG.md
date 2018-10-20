# Changelog

## [4.1.4] - 2018-10-21
### Added
- Added building macOS GUI app
- Added zipping every binary
- Added checking `showEvents`

## [4.1.3] - 2018-10-16
### Changed
- Fixed error loop by adding a check if Discord channels are defined

## [4.1.2] - 2018-10-14
### Changed
- Fixed `undefined` message on plan creation
- Fixed not waiting for attachments
- Fixed missing username/avatar in Discord - Discord messages
- Fixed empty logs

## [4.1.1] - 2018-10-12
### Added
- More support for extensible attachments

## [4.1.0] - 2018-10-12
### Added
- userMentions switch for Discord

### Changed
- Attachment parsing system
- Fixed @everyone detection

## [4.0.2] - 2018-10-06
### Changed
- Fixed attachment size calculation (again)

## [4.0.1] - 2018-10-06
### Changed
- Updated `libfb` to fix not sending messages
- Cleaned up the config by moving timestamps and channels to separate categories
- Fixed attachment size calculation

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
