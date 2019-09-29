# Changelog

## [5.0.2] - 2019-09-29
### Fixed
- Fixed loop after Facebook failed login

## [5.0.0] - 2019-09-29
### Added
- REST API
- Web dashboard
- Web setup
- Auto-restarting
- Support for Messenger mentions
- Support for multiple Facebook accounts
- Remote storage support
- Pausing the whole instance
- Better error descriptions
- Support for disabling Messenger or Discord
- Discord statuses when logging in (`idle`) or login failed (`dnd`)
- Funding via Liberapay

### Changed
- Refactored the code to TypeScript
- Changed `set`/`get` commands to `config` command

### Removed
- `channels.yml` support
- `config.errorChannel` and `config.commandChannel` properties support

## [4.7.1] - 2019-01-29
### Fixed
- Crash loop on sending errors

## [4.7.0] - 2019-01-24
### Added
- Support for multiple command channels
- Sending custom emoji from Messenger to Discord
- Restart command

### Changed
- Quit command actually quits

### Fixed
- Handling multiple role mentions when first one is not mentionable
- Setting guilds when main guild is set
- Resetting loginFailed variable before restart

## [4.6.4] - 2019-01-14
### Changed
- Improved Dockerfiles

### Fixed
- Made channel renaming use thread clean name

## [4.6.3] - 2019-01-12
### Added
- Checking if name is not null when renaming
- Not restarting when login failed

### Fixed
- Accessing command param without checking
- Misleading missing thread error message

## [4.6.2] - 2019-01-09
### Fixed
- Showing log folder path on error

### Changed
- Sentry endpoint

### Added
- Ignoring user-fault errors

## [4.6.1] - 2019-01-04
### Fixed
- Crash on failed attachment URL request
- A typo in help command

## [4.6.0] - 2019-01-04
### Added
- `broadcast` command
- Automatic error reporting (thanks to Sentry)

### Fixed
- Animated emoji recognition

## [4.5.4] - 2019-01-01
### Changed
- Added using node-fetch instead of request

## [4.5.3] - 2019-01-01
### Fixed
- Crash on creating a connection

## [4.5.2] - 2018-12-27
### Fixed
- Crash on creating a webhook
- Sending message between FB chats without Discord

## [4.5.1] - 2018-12-26
### Fixed
- Crash on `add` command

## [4.5.0] - 2018-12-26
### Added
- config.messenger.handlePlans
- config.messenger.handlePolls
- config.messenger.showPlanDetails
- config.messenger.showPollDetails

### Fixed
- Sending attachments to multiple Facebook chats
- Thread names in polls/plans with multiple Facebook chats

### Changed
- Initial thread download count -> 200
- config.discord.showEvents -> config.messenger.handleEvents

### Removed
- Accidental `FATAL` log

## [4.4.5] - 2018-12-22
### Fixed
- Custom emoji matching

## [4.4.4] - 2018-12-22
### Fixed
- Gzipping old logs

## [4.4.3] - 2018-12-21
### Fixed
- Auto-restart "timeout"

## [4.4.2] - 2018-12-20
### Added
- Gzipping old logs

### Fixed
- Duplicate timestamping
- Incrementing a number in temporary filenames

### Removed
- `timestamps` config section

## [4.4.1] - 2018-12-20
### Added
- Blocking running as root
- Full config path resolving

## [4.4.0] - 2018-12-17
### Added
- Location maps support
- Thread customization event support (color/emoji changes)

### Fixed
- Undefined images
- Polls support
- `getPath` returning config path

## [4.3.1] - 2018-12-16
### Fixed
- Data path being ignored

## [4.3.0] - 2018-12-15
### Added
- Polls support
- Homebrew install instructions

### Changed
- `config` CLI parameter is now `dataPath` (see #370)

### Fixed
- XMA attachment bugs
- Getting sender object in the runtime
- Some typos

## [4.2.1] - 2018-12-05
### Fixed
- Config path being "undefined" on Node 9 and lower

### Removed
- config.messenger.whitelist

## [4.2.0] - 2018-12-02
### Added
- Auto-restart
- Not closing Windows .exe when no config
- Logging on m!keep
- config.ignoredSequences
- config.discord.ignoreBots
- config.discord.ignoredUsers

### Fixed
- Timezone issues
- Null attachment URL
- Sending embed images when embeds are disabled

## [4.1.11] - 2018-11-14
### Changed
- Fixed bug with not receiving messages from Messenger (I mean, upgraded `libfb`)
- Stole @alufers's logger from ChatPlug
- Fixed timezone issues

## [4.1.10] - 2018-11-04
### Changed
- Fixed crash on invalid Discord channel IDs

## [4.1.9] - 2018-11-04
### Changed
- Fixed setting log level

## [4.1.8] - 2018-11-04
### Changed
- Fixed object logging depth

## [4.1.7] - 2018-11-04
### Changed
- Upgraded `consola` logger
- Upgraded `libfb` (again)

## [4.1.6] - 2018-10-22
### Changed
- Downgraded `libfb` back.

## [4.1.5] - 2018-10-21
### Changed
- Updated `libfb` to support reconnecting

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
