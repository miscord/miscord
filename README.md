# Miscord <img src="../gh-pages/img/icon.png" width="60">
> Simple Facebook Messenger to Discord bridge for Node.js built on [facebook-chat-api](https://github.com/Schmavery/facebook-chat-api) and [discord.js](https://discord.js.org)

**[Website](https://miscord.js.org/)** &nbsp; **[Donate](#donate)** &nbsp; **[FAQ](../../wiki/faq)**

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
- Mac/Linux: `~/.config/Miscord/config.json`
- Other: ~/.miscord.json

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
    <td rowspan="2">
      Miscord<br />
      `*`<br />
      `MISCORD_*`
    </td>
    <td>`logLevel`</td>
    <td>`LOG_LEVEL`</td>
    <td>Log level (see <a href="https://github.com/npm/npmlog#loglevelprefix-message-">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td>`"info"`</td>
  </tr>
  <tr>
    <td>`checkUpdates`</td>
    <td>`CHECK_UPDATES`</td>
    <td>Checking updates</td>
    <td>:heavy_check_mark:</td>
    <td>`true`</td>
  </tr>  
  <tr>
    <td>`custom`</td>
    <td>`CUSTOM`</td>
    <td>Custom channel map (see <a href="../../wiki/custom-mapping">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td>`{}`</td>
  </tr>
  <tr>
    <td rowspan="5">
      Messenger<br />
      `messenger.*`<br />
      `MESSENGER_*`
    </td>
    <td>`username`</td>
    <td>`USERNAME`</td>
    <td>Messenger username</td>
    <td>:heavy_multiplication_x:</td>
    <td>`(none)`</td>
  </tr>
  <tr>
    <td>`password`</td>
    <td>`PASSWORD`</td>
    <td>Messenger password</td>
    <td>:heavy_multiplication_x:</td>
    <td>`(none)`</td>
  </tr>
  <tr>
    <td>`forceLogin`</td>
    <td>`FORCE_LOGIN`</td>
    <td>Forces logging in to Facebook</td>
    <td>:heavy_check_mark:</td>
    <td>`false`</td>
  </tr>
  <tr>
    <td>`showUsername`</td>
    <td>`SHOW_USERNAME`</td>
    <td>Shows Discord usernames on Facebook</td>
    <td>:heavy_check_mark:</td>
    <td>`true`</td>
  </tr>
  <tr>
    <td>`boldUsername`</td>
    <td>`BOLD_USERNAME`</td>
    <td>Makes Discord usernames on Facebook bold (see <a href="../../issues/88">#88</a>)</td>
    <td>:heavy_check_mark:</td>
    <td>`false`</td>
  </tr>
  <tr>
    <td>`filter.whitelist`</td>
    <td>`FILTER_WHITELIST`</td>
    <td>Messenger chat filtering (see <a href="../../wiki/filtering">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td>`[]`</td>
  </tr>
  <tr>
    <td>`filter.blacklist`</td>
    <td>`FILTER_BLACKLIST`</td>
    <td>Messenger chat filtering (see <a href="../../wiki/filtering">here</a>)</td>
    <td>:heavy_check_mark:</td>
    <td>`[]`</td>
  </tr>
  <tr>
    <td rowspan="5">
      Discord<br />
      `discord.*`<br />
      `DISCORD_*`
    </td>
    <td>`token`</td>
    <td>`TOKEN`</td>
    <td>Discord token</td>
    <td>:heavy_multiplication_x:</td>
    <td>`(none)`</td>
  </tr>
  <tr>
    <td>`guild`</td>
    <td>`GUILD`</td>
    <td>Discord guild (server)</td>
    <td>:heavy_check_mark:</td>
    <td>(first guild available)</td>
  </tr>
  <tr>
    <td>`category`</td>
    <td>`CATEGORY`</td>
    <td>Discord category on server</td>
    <td>:heavy_check_mark:</td>
    <td>new category named `messenger`</td>
  </tr>
  <tr>
    <td>`sendNotifications`</td>
    <td>`SEND_NOTIFICATIONS`</td>
    <td>Sends notifications when appending to existing embeds (see <a href="../../issues/71">#71</a>)</td>
    <td>:heavy_check_mark:</td>
    <td>`true`</td>
  </tr>
  <tr>
    <td>`noEmbeds`</td>
    <td>`NO_EMBEDS`</td>
    <td>Sends plaintext messages without embeds</td>
    <td>:heavy_check_mark:</td>
    <td>`false`</td>
  </tr>
  <tr>
    <td>`renameChannels`</td>
    <td>`RENAME_CHANNELS`</td>
    <td>Renames channels according to Messenger</td>
    <td>:heavy_check_mark:</td>
    <td>`true`</td>
  </tr>
</table>

## Donate

[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=6MVRTWBXNH8J6)

**BTC**: <a href="bitcoin://36tci1gptNyPhvSJkrHg2EdVmH82cwW56R">36tci1gptNyPhvSJkrHg2EdVmH82cwW56R</a>  
**ETH**: 0xe841ef23e1b94ed2122d248377e9fbeffebaad35  
**ZEC**: t1ULEWqCCmVxmaxsRn5KGRXnDmeBY68uMWL
