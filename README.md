![messenger-discord](https://user-images.githubusercontent.com/26630168/36616623-bbee32b4-18e4-11e8-955f-ddbbff8e03b3.png)

Facebook Messenger to Discord bridge for Node.js

### Setup

Create new Discord application [here](https://discordapp.com/developers/applications/me)

Click "new app", choose a name for your application, confirm by clicking "create app"

Add "bot user" to your application

Open "OAuth URL Generator", choose scope "bot" and copy link to your browser

Add your bot to chosen guild

**Warning: the guild has to be empty or have no text channels with only numbers in topic. Bot checks if channel is associated with a Facebook chat by checking if topic is only numbers (thread ID). It can crash otherwise**

Install Node.js - download [here](https://nodejs.org/en/download/)

### Usage

*If you don't know what Docker is, use "Local install"*

**Local install**
```bash
git clone https://github.com/Bjornskjald/messenger-discord # or download a zip from GitHub repo and extract it to folder of your choice
cd messenger-discord # if you download the zip you might need to provide a full path, like C:\Users\User\Downloads\messenger-discord
npm install
```

Copy/rename "config.example.json" to "config.json" and fill it with needed info:
- Discord token
- Facebook username/email
- Facebook password

Everything else is optional.

**Docker install**
```bash
docker run -d -e FACEBOOK_LOGIN=facebook@username.or.email -e FACEBOOK_PASSWORD=yourfacebookpass -e DISCORD_TOKEN=token -e DISCORD_GUILD=nameofyourguild Bjornskjald/messenger-discord
```

**Configuration**

| Environmental variable |  Value in config  | Description |
| ---------------------- | ----------------- | ----------- |
| `FACEBOOK_USERNAME` | `facebook.username` | Facebook username |
| `FACEBOOK_PASSWORD` | `facebook.password` | Facebook password |
| `DISCORD_TOKEN` | `discord.token` | Discord token |
| `FACEBOOK_FORCELOGIN` | `facebook.force` | Forces logging in to Facebook (mostly caused by latest logins review) (default: `false`)|
| `DISCORD_GUILD` | `discord.guild` | Discord guild (default: first guild available)|
| `DISCORD_CATEGORY` | `discord.category` | Category of channels on Discord (default: `messenger`)|
| `DISCORD_SHOW_USERNAME` | `discord.showUsername` | Enables showing Discord username in Facebook messages (default: `true`)|

**Usage**
```bash
npm start
```

The bot will automatically create channels corresponding to threads on Messenger, sending message to these channels will send it to Messenger

### Troubleshooting

- Restart the bridge
- Remove appstate.json file
- Check your internet connection
- Make sure no text in config has trailing spaces
- If this doesn't work, create new issue [here](https://github.com/Bjornskjald/messenger-discord/issues) with your error log
