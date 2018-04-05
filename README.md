![banner](../gh-pages/img/banner.png)

> Built on [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) and [discord.js](https://discord.js.org)

[![code style: Standard.js](https://img.shields.io/badge/code%20style-standard.js-green.svg?style=flat-square)](https://standardjs.com/)
[![Travis](https://img.shields.io/travis/Bjornskjald/miscord.svg?style=flat-square)](https://travis-ci.org/Bjornskjald/miscord/)
[![NPM downloads](https://img.shields.io/npm/dt/miscord.svg?style=flat-square)](https://npmjs.org/package/miscord)
[![NPM version](https://img.shields.io/npm/v/miscord.svg?style=flat-square&label=NPM%20version)](https://npmjs.org/package/miscord)
[![GitHub release](https://img.shields.io/github/release/Bjornskjald/miscord.svg?style=flat-square&label=GitHub%20version)](../../releases/latest)
![Requires.io](https://img.shields.io/requires/github/Bjornskjald/miscord.svg?style=flat-square)

**[Website](https://miscord.js.org/)** &nbsp; **[Donate](#donate)** &nbsp; **[FAQ](../../wiki/faq)** &nbsp; **[Support Server](https://discord.gg/DkmTvVz)**

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
- Add permissions: `Manage Channels` and whole `Text Permissions` group, then copy link to your browser
- Add your bot to chosen guild(s)

## Installation
- [Binary packages](../../releases/latest)
- [NPM install](../../wiki/install#npm)
- [Local install](../../wiki/install#local)
- [Docker install](../../wiki/install#docker)

**Try not to create channels in bots category. If you really need, make sure the channel hasn't got only numbers in its topic.**  
**Make sure you have "Show website preview info from links pasted into chat" enabled in "Text & Images" Discord settings**


## Configuration

Configuration file:
- Windows: `%appdata%/Miscord/config.json`
- Mac: `~/Library/Application Support/Miscord/config.json`
- Linux: `~/.config/Miscord/config.json`
- Other: `~/.miscord/config.json`

<table>
  <tr>
    <th>Category</th>
    <th>Config variable</th>
    <th>Environmental variable</th>
    <th>Description</th>
    <th>Optional</th>
    <th>Default value</th>
  </tr>
  <tr>
    <td rowspan="3">
      Miscord<br />
      <code>*</code><br />
      <code>MISCORD_*</code>
    </td>
    <td><code>logLevel</code></td>
    <td><code>LOG_LEVEL</code></td>
    <td>Log level (see <a href="https://github.com/npm/npmlog#loglevelprefix-message-">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>"info"</code></td>
  </tr>
  <tr>
    <td><code>checkUpdates</code></td>
    <td><code>CHECK_UPDATES</code></td>
    <td>Checking updates</td>
    <td>:heavy_check_mark:</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>custom</code></td>
    <td><code>CUSTOM</code></td>
    <td>Custom channel map (see <a href="../../wiki/custom-mapping">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>{}</code></td>
  </tr>
  <tr>
    <td rowspan="7">
      Messenger<br />
      <code>messenger.*</code><br />
      <code>MESSENGER_*</code>
    </td>
    <td><code>username</code></td>
    <td><code>USERNAME</code></td>
    <td>Messenger username</td>
    <td>:heavy_multiplication_x:</td>
    <td>:heavy_multiplication_x:</td>
  </tr>
  <tr>
    <td><code>password</code></td>
    <td><code>PASSWORD</code></td>
    <td>Messenger password</td>
    <td>:heavy_multiplication_x:</td>
    <td>:heavy_multiplication_x:</td>
  </tr>
  <tr>
    <td><code>forceLogin</code></td>
    <td><code>FORCE_LOGIN</code></td>
    <td>Forces logging in to Facebook</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>showUsername</code></td>
    <td><code>SHOW_USERNAME</code></td>
    <td>Shows Discord usernames on Facebook</td>
    <td>:heavy_check_mark:</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>boldUsername</code></td>
    <td><code>BOLD_USERNAME</code></td>
    <td>Makes Discord usernames on Facebook bold (see <a href="../../issues/88">#88</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>filter.whitelist</code></td>
    <td><code>FILTER_WHITELIST</code></td>
    <td>Messenger chat filtering (see <a href="../../wiki/filtering">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>[]</code></td>
  </tr>
  <tr>
    <td><code>filter.blacklist</code></td>
    <td><code>FILTER_BLACKLIST</code></td>
    <td>Messenger chat filtering (see <a href="../../wiki/filtering">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>[]</code></td>
  </tr>
  <tr>
    <td rowspan="7">
      Discord<br />
      <code>discord.*</code><br />
      <code>DISCORD_*</code>
    </td>
    <td><code>token</code></td>
    <td><code>TOKEN</code></td>
    <td>Discord token</td>
    <td>:heavy_multiplication_x:</td>
    <td>:heavy_multiplication_x:</td>
  </tr>
  <tr>
    <td><code>guild</code></td>
    <td><code>GUILD</code></td>
    <td>Discord guild (server)</td>
    <td>:heavy_check_mark:</td>
    <td>(first guild available)</td>
  </tr>
  <tr>
    <td><code>category</code></td>
    <td><code>CATEGORY</code></td>
    <td>Discord category on server</td>
    <td>:heavy_check_mark:</td>
    <td>new category named <code>messenger</code></td>
  </tr>
  <tr>
    <td><code>sendNotifications</code></td>
    <td><code>SEND_NOTIFICATIONS</code></td>
    <td>Sends notifications when appending to existing embeds (see <a href="../../issues/71">#71</a>)</td>
    <td>:heavy_check_mark:</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>noEmbeds</code></td>
    <td><code>NO_EMBEDS</code></td>
    <td>Sends plaintext messages without embeds</td>
    <td>:heavy_check_mark:</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>renameChannels</code></td>
    <td><code>RENAME_CHANNELS</code></td>
    <td>Renames channels according to Messenger</td>
    <td>:heavy_check_mark:</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>showEvents</code></td>
    <td><code>SHOW_EVENTS</code></td>
    <td>Shows Facebook events on Discord</td>
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
