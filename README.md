# Miscord <img src="../gh-pages/img/icon.png" width="60">
> Simple Facebook Messenger to Discord bridge for Node.js

**[Website](http://miscord.js.org/)**

<br>

<a href="http://miscord.js.org/">
  <img src="../gh-pages/img/screenshot.png" style="max-width: 80%">
</a>

## Setup

- Install Git - download [here](https://git-scm.com/download/win), make sure to add Git to PATH
- Install Node.js - download [here](https://nodejs.org/en/download/) (**version 8.x.x at least**)
- Create new Discord application [here](https://discordapp.com/developers/applications/me)
- Click "new app", choose a name for your application, confirm by clicking "create app"
- Add "bot user" to your application
- Open "OAuth URL Generator", choose scope "bot" and copy link to your browser
- Add your bot to chosen guild

**Try not to create channels in bots category. If you really need, make sure the channel hasn't got only numbers in its topic.**


## Usage

*If you don't know what Docker is, use "Local install"*

**Local install**
```bash
git clone https://github.com/Bjornskjald/miscord # or download a zip from GitHub repo and extract it to folder of your choice
cd miscord # if you download the zip you might need to provide a full path, like C:\Users\User\Downloads\miscord-master
npm install
```

Copy/rename "config.example.json" to "config.json" and fill it with needed info:
- Discord token
- Facebook username/email
- Facebook password

Everything else is optional.

**Docker install**
```bash
docker run -d -e FACEBOOK_LOGIN=facebook@username.or.email -e FACEBOOK_PASSWORD=yourfacebookpass -e DISCORD_TOKEN=token Bjornskjald/miscord
``` 

**Configuration**

| Environmental variable |  Value in config  | Description | Optional | Default value |
| ---------------------- | ----------------- | ----------- | -------- | ------------- |
| `FACEBOOK_USERNAME` | `facebook.username` | Facebook username | :heavy_multiplication_x: | none |
| `FACEBOOK_PASSWORD` | `facebook.password` | Facebook password | :heavy_multiplication_x: | none |
| `DISCORD_TOKEN` | `discord.token` | Discord token | :heavy_multiplication_x: | none |
| `FACEBOOK_FORCE_LOGIN` | `facebook.forceLogin` | Forces logging in to Facebook (mostly caused by latest logins review) | :heavy_check_mark: | `false` |
| `DISCORD_GUILD` | `discord.guild` | Discord guild | :heavy_check_mark: | (first guild available) |
| `DISCORD_CATEGORY` | `discord.category` | Category of channels on Discord | :heavy_check_mark: | `messenger` |
| `DISCORD_SHOW_USERNAME` | `discord.showUsername` | Enables showing Discord username in Facebook messages | :heavy_check_mark: | `true` |
| `DISCORD_SEND_NOTIFICATIONS` | `discord.sendNotifications` | Enables sending notifications when appending to existing embeds (see #71) | :heavy_check_mark: | `true` |

**Usage**
```bash
npm start
```

The bot will automatically create channels corresponding to threads on Messenger, sending message to these channels will send it to Messenger

## Troubleshooting

- Restart the bridge
- Remove appstate.json file
- Check your internet connection
- Make sure no text in config has trailing spaces
- Login with a browser to check for pending login reviews
- If this doesn't work, create new issue [here](https://github.com/Bjornskjald/miscord/issues) with your error log
