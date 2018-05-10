![banner](../gh-pages/img/banner.png)

> Built on [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) and [discord.js](https://discord.js.org)

[![code style: Standard.js](https://img.shields.io/badge/code%20style-standard.js-green.svg?style=flat-square)](https://standardjs.com/)
[![Travis](https://img.shields.io/travis/Bjornskjald/miscord.svg?style=flat-square)](https://travis-ci.org/Bjornskjald/miscord/)
[![NPM downloads](https://img.shields.io/npm/dt/miscord.svg?style=flat-square)](https://npmjs.org/package/miscord)
[![NPM version](https://img.shields.io/npm/v/miscord.svg?style=flat-square&label=NPM%20version)](https://npmjs.org/package/miscord)
[![GitHub release](https://img.shields.io/github/release/Bjornskjald/miscord.svg?style=flat-square&label=GitHub%20version)](../../releases/latest)
![Requires.io](https://img.shields.io/requires/github/Bjornskjald/miscord.svg?style=flat-square)

**[Website](https://miscord.js.org/)** &nbsp;
**[Donate](#donate)** &nbsp;
**[FAQ](../../wiki/faq)** &nbsp;
**[Config Generator](https://miscord.js.org/config-generator.html)** &nbsp;
**[Support Server](https://discord.gg/DkmTvVz)**

<br>

<a href="https://miscord.js.org/">
  <img src="../gh-pages/img/screenshot.png" style="max-width: 80%">
</a>

# Setup

## Discord Bot

- Create new Discord application [here](https://discordapp.com/developers/applications/me)
- Click "new app", choose a name for your application, confirm by clicking "create app"
- Create a Bot User on your app's page
- Open "OAuth URL Generator", choose scope `bot`
- Add permissions: `Manage Channels`, `Manage Webhooks` and whole `Text Permissions` group (or just `Administrator`), then copy link to your browser
- Add your bot to chosen guild(s)

## Installation
- [Binary packages](../../releases/latest)
- [NPM install](../../wiki/install#npm)
- [Local install](../../wiki/install#local)
- [Docker install](../../wiki/install#docker)

**Try not to create channels in bots category. If you really need, make sure the channel hasn't got only numbers in its topic.**  
**Make sure you have "Show website preview info from links pasted into chat" enabled in "Text & Images" Discord settings**


## Configuration

Default location of config file:
- Windows: `%appdata%/Miscord/config.json`
- Mac: `~/Library/Application Support/Miscord/config.json`
- Linux: `~/.config/Miscord/config.json`
- Other: `~/.miscord/config.json`

<table>
  <tr>
    <th>Category</th>
    <th>Config variable</th>
    <th>Description</th>
    <th>Optional</th>
    <th>Default value</th>
  </tr>
  <tr>
    <td rowspan="3">
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
    <td><code>custom</code></td>
    <td>Custom channel map (see <a href="../../wiki/custom-mapping">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>{}</code></td>
  </tr>
  <tr>
    <td rowspan="9">
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
    <td><code>separateImages</code></td>
    <td>Sends images on Messenger separate from text</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>format</code></td>
    <td>Format of the message (see <a href="../../wiki/format">here</a></td>
    <td>:heavy_check_mark:</td>
    <td><code>*{username}*: {message}</code></td>
  </tr>
  <tr>
    <td><code>link</code></td>
    <td>Link between Messenger chats (see <a href="../../wiki/linking">here</a></td>
    <td>:heavy_check_mark:</td>
    <td><code>{}</code></td>
  </tr>
  <tr>
    <td><code>ignoreEmbeds</code></td>
    <td>Disables embed parsing from Discord</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
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

## Running

### Binaries/NPM install

Run `miscord` in the console.  
_If you store your config somewhere else, you can run it with `miscord --config {path}`_

### Local install

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

miscord(config).then(config => {
  // there are Discord and Messenger clients added to config variable
  // config.messenger.client
  // config.discord.client
}
```

## Donate

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6MVRTWBXNH8J6)

**BTC**: <a href="bitcoin://36tci1gptNyPhvSJkrHg2EdVmH82cwW56R">36tci1gptNyPhvSJkrHg2EdVmH82cwW56R</a>  
**ETH**: 0xe841ef23e1b94ed2122d248377e9fbeffebaad35  
**ZEC**: t1ULEWqCCmVxmaxsRn5KGRXnDmeBY68uMWL
