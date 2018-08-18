![banner](../gh-pages/img/banner.png)

> Built on [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) and [discord.js](https://discord.js.org)

[![Standard.js](https://img.shields.io/badge/code%20style-standard.js-green.svg?style=flat-square)](https://standardjs.com/)
[![Travis](https://img.shields.io/travis/miscord/miscord.svg?style=flat-square)](https://travis-ci.org/miscord/miscord/)
[![NPM downloads](https://img.shields.io/npm/dt/miscord.svg?style=flat-square)](https://npmjs.org/package/miscord)
[![Version](https://img.shields.io/npm/v/miscord.svg?style=flat-square)](https://npmjs.org/package/miscord)
[![Discord](https://discordapp.com/api/guilds/431471556540104724/embed.png)](https://discord.gg/DkmTvVz)

**[Website](https://miscord.net/)** &nbsp;
**[Donate](#moneybag-donate)** &nbsp;
**[FAQ](../../wiki/faq)** &nbsp;
**[Config Generator](https://miscord.net/config-generator.html)** &nbsp;
**[Support Server](https://discord.gg/DkmTvVz)**

<br>

<a href="https://miscord.net/">
  <img src="../gh-pages/img/screenshot.png" style="max-width: 80%">
</a>

# :wrench: Setup

## Discord Bot

- Follow a guide [here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) to get the token
- Run Miscord after configuration, it will provide you a link to add the bot to your server

*or*

- Open "OAuth URL Generator", choose scope `bot`
- Add permissions: `Manage Channels`, `Manage Webhooks` and whole `Text Permissions` group (or just `Administrator`), then copy link to your browser
- Add your bot to chosen server(s)

## Installation
- [Binary packages](../../releases/latest)
- [NPM install (preferred method)](../../wiki/install#npm)
- [Docker install](../../wiki/install#docker)

## Configuration

Default location of config file:
- Windows: `%appdata%/Miscord/config.json`
- Mac: `~/Library/Application Support/Miscord/config.json`
- Linux: `~/.config/Miscord/config.json`
- Other: `~/.miscord/config.json`

**You can use config generator [here](https://miscord.net/config-generator.html)**

**See all config properties [here](../../wiki/configuration)**

# :electric_plug: Running

## Binaries/NPM install

Run `miscord` in the console.
_If you store your config somewhere else, you can run it with `miscord --config {path}`_

## Local install

Enter the Miscord directory where you cloned it (`cd miscord`)  
Run it using `npm start`.  
_If you store your config somewhere else, you can run it with `npm start -- --config {path}` (note the `--` before `--config`)_  
(Note: you can enable developing environment with `NODE_ENV=development`. Miscord will read config.json from your current directory)

## Module usage

You can use Miscord as a module in your script  
Example:
```javascript
const miscord = require('miscord')
const config = // ...

miscord(config).then(() => {
  // there are Discord and Messenger clients added to global config variable
  // config.messenger.client
  // config.discord.client
}
```

# :moneybag: Donate

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6MVRTWBXNH8J6)

**BTC**: <a href="bitcoin://36tci1gptNyPhvSJkrHg2EdVmH82cwW56R">36tci1gptNyPhvSJkrHg2EdVmH82cwW56R</a>  
**ETH**: 0xe841ef23e1b94ed2122d248377e9fbeffebaad35  
**ZEC**: t1ULEWqCCmVxmaxsRn5KGRXnDmeBY68uMWL

# :warning: Disclaimer

We do not guarantee that this bridge will work correctly. We are not responsible for getting banned on any serivices integrated with Miscord. Use at your own discretion.

All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.

Facebook and the Facebook logo are trademarks or registered trademarks of Facebook, Inc., used under license agreement.

# :scroll: License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
