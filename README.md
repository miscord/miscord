![banner](../gh-pages/img/banner.png)

> Built on [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) and [discord.js](https://discord.js.org)

[![code style: Standard.js](https://img.shields.io/badge/code%20style-standard.js-green.svg?style=flat-square)](https://standardjs.com/)
[![Travis](https://img.shields.io/travis/Bjornskjald/miscord.svg?style=flat-square)](https://travis-ci.org/Bjornskjald/miscord/)
[![NPM downloads](https://img.shields.io/npm/dt/miscord.svg?style=flat-square)](https://npmjs.org/package/miscord)
[![NPM version](https://img.shields.io/npm/v/miscord.svg?style=flat-square&label=NPM%20version)](https://npmjs.org/package/miscord)
[![GitHub release](https://img.shields.io/github/release/Bjornskjald/miscord.svg?style=flat-square&label=GitHub%20version)](../../releases/latest)
![Requires.io](https://img.shields.io/requires/github/Bjornskjald/miscord.svg?style=flat-square)

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

**Try not to create channels with only numbers in its topic, Miscord can crash otherwise.**

## Configuration

Default location of config file:
- Windows: `%appdata%/Miscord/config.json`
- Mac: `~/Library/Application Support/Miscord/config.json`
- Linux: `~/.config/Miscord/config.json`
- Other: `~/.miscord/config.json`

**You can use config generator [here](https://miscord.net/config-generator.html)**

<table>
  <tr>
    <th>Category</th>
    <th>Config variable</th>
    <th>Description</th>
    <th>Optional</th>
    <th>Default value</th>
  </tr>
  <tr>
    <td rowspan="4">
      Miscord<br />
      <code>*</code>
    </td>
    <td><code>logLevel</code></td>
    <td>Log level (see <a href="https://github.com/npm/npmlog#loglevelprefix-message-">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>"info"</code></td>
  </tr>
  <tr>
    <td><code>checkUpdates</code></td>
    <td>Checking updates</td>
    <td>:heavy_check_mark:</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>ownerID</code></td>
    <td>Discord owner's ID</td>
    <td>:heavy_check_mark:</td>
    <td><code>(none)</code></td>
  </tr>
  <tr>
    <td rowspan="10">
      Messenger<br />
      <code>messenger.*</code>
    </td>
    <td><code>username</code></td>
    <td>Messenger username</td>
    <td>:heavy_multiplication_x:</td>
    <td>:heavy_multiplication_x:</td>
  </tr>
  <tr>
    <td><code>password</code></td>
    <td>Messenger password</td>
    <td>:heavy_multiplication_x:</td>
    <td>:heavy_multiplication_x:</td>
  </tr>
  <tr>
    <td><code>forceLogin</code></td>
    <td>Forces logging in to Facebook</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>filter.whitelist</code></td>
    <td>Messenger chat filtering (see <a href="../../wiki/filtering">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>[]</code></td>
  </tr>
  <tr>
    <td><code>filter.blacklist</code></td>
    <td>Messenger chat filtering (see <a href="../../wiki/filtering">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>[]</code></td>
  </tr>
  <tr>
    <td><code>format</code></td>
    <td>Format of the message (see <a href="../../wiki/format">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>*{username}*: {message}</code></td>
  </tr>
  <tr>
    <td><code>ignoreEmbeds</code></td>
    <td>Disables embed parsing from Discord</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>sourceFormat.discord</code></td>
    <td>Format of the Discord source in message</td>
    <td>:heavy_check_mark:</td>
    <td><code>(Discord)</code></td>
  </tr>
  <tr>
    <td><code>sourceFormat.messenger</code></td>
    <td>Format of the Messenger source in message<br>Group name: <code>{name}</code></td>
    <td>:heavy_check_mark:</td>
    <td><code>(Messenger: {name})</code></td>
  </tr>
  <tr>
    <td rowspan="6">
      Discord<br />
      <code>discord.*</code>
    </td>
    <td><code>token</code></td>
    <td>Discord token</td>
    <td>:heavy_multiplication_x:</td>
    <td>:heavy_multiplication_x:</td>
  </tr>
  <tr>
    <td><code>guild</code></td>
    <td>Discord guild (server)</td>
    <td>:heavy_check_mark:</td>
    <td>(first guild available)</td>
  </tr>
  <tr>
    <td><code>category</code></td>
    <td>Discord category name/id on the server</td>
    <td>:heavy_check_mark:</td>
    <td>(none)</td>
  </tr>
  <tr>
    <td><code>renameChannels</code></td>
    <td>Renames channels according to Messenger</td>
    <td>:heavy_check_mark:</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>showEvents</code></td>
    <td>Shows Facebook events on Discord</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>showFullNames</code></td>
    <td>Shows Facebook users' full names alongside their nicknames on Discord</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
</table>

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
