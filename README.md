![banner](../gh-pages/img/banner.png)

> Built on [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) and [discord.js](https://discord.js.org)

[![Standard.js](https://img.shields.io/badge/code%20style-standard.js-green.svg?style=flat-square)](https://standardjs.com/)
[![Travis](https://img.shields.io/travis/miscord/miscord.svg?style=flat-square)](https://travis-ci.org/miscord/miscord/)
[![NPM downloads](https://img.shields.io/npm/dt/miscord.svg?style=flat-square)](https://npmjs.org/package/miscord)
[![Version](https://img.shields.io/npm/v/miscord.svg?style=flat-square)](https://npmjs.org/package/miscord)
[![Discord](https://discordapp.com/api/guilds/431471556540104724/embed.png)](https://discord.gg/DkmTvVz)

**[Website](https://miscord.net/)** &nbsp;
**[Donate](https://paypal.me/Bjornskjald)** &nbsp;
**[FAQ](../../wiki/faq)** &nbsp;
**[Config Generator](https://miscord.net/config-generator.html)** &nbsp;

<br>

<a href="https://miscord.net/">
  <img src="../gh-pages/img/screenshot.png" style="max-width: 80%">
</a>

# :wrench: Setup

## Configuration

**Follow a guide [here](../../wiki/Creating-a-Discord-bot) to get the Discord token**

Default location of config file:
- Windows: `%appdata%/Miscord/config.json`
- Mac: `~/Library/Application Support/Miscord/config.json`
- Linux: `~/.config/Miscord/config.json`
- Other: `~/.miscord/config.json`

**You can use config generator [here](https://miscord.net/config-generator.html)**

**Example config: see [here](config.example.json)**

**See all config properties [here](../../wiki/configuration)**

## Installation
- [NPM install (recommended method)](../../wiki/install#npm)
- [Binary packages](../../releases/latest)
- [Docker install](../../wiki/install#docker)

# :electric_plug: Running

## Binaries/NPM install

Run `miscord` in the console.
_If you store your config somewhere else, you can run it with `miscord --config {path}`_ like this:  
*In this example config is stored in a folder called miscord in your home directory*

```
miscord --config ~/miscord/config.json
```

## Local install

Enter the Miscord directory where you cloned it (`cd miscord`)  
Run it using `npm start`.  
_If you store your config somewhere else, you can run it with `npm start -- --config {path}` (note the `--` before `--config`)_ like this:  
*In this example config is stored in a folder called miscord in your home directory*

```
npm start -- --config ~/miscord/config.json
```

# :warning: Disclaimer

We do not guarantee that this bridge will work correctly. We are not responsible for getting banned on any serivices integrated with Miscord. Use at your own discretion.

All product and company names are trademarks™ or registered® trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by them.

Facebook and the Facebook logo are trademarks or registered trademarks of Facebook, Inc., used under license agreement.

# :scroll: License
This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.
