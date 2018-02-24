![messenger-discord](https://user-images.githubusercontent.com/26630168/36616623-bbee32b4-18e4-11e8-955f-ddbbff8e03b3.png)

**Facebook Messenger to Discord bridge for Node.js**

## Screenshots

### Message
![message](https://user-images.githubusercontent.com/26630168/36634178-dfbd35ac-19a0-11e8-8c60-2969b37f5282.png)

### Nickname
![nickname](https://user-images.githubusercontent.com/26630168/36634196-1d71dfd8-19a1-11e8-93b1-71313bf8cd4a.png)

## Setup

- Install Node.js - download [here](https://nodejs.org/en/download/)
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
git clone https://github.com/Bjornskjald/messenger-discord # or download a zip from GitHub repo and extract it to folder of your choice
cd messenger-discord # if you download the zip you might need to provide a full path, like C:\Users\User\Downloads\messenger-discord-master
npm install
```

Copy/rename "config.example.json" to "config.json" and fill it with needed info:
- Discord token
- Facebook username/email
- Facebook password

Everything else is optional.

**Docker install**
```bash
docker run -d -e FACEBOOK_LOGIN=facebook@username.or.email -e FACEBOOK_PASSWORD=yourfacebookpass -e DISCORD_TOKEN=token Bjornskjald/messenger-discord
``` 

**Configuration**

| Environmental variable |  Value in config  | Description | Optional | Default value |
| ---------------------- | ----------------- | ----------- | -------- | ------------- |
| `FACEBOOK_USERNAME` | `facebook.username` | Facebook username | :heavy_multiplication_x: | none |
| `FACEBOOK_PASSWORD` | `facebook.password` | Facebook password | :heavy_multiplication_x: | none |
| `DISCORD_TOKEN` | `discord.token` | Discord token | :heavy_multiplication_x: | none |
| `FACEBOOK_FORCELOGIN` | `facebook.force` | Forces logging in to Facebook (mostly caused by latest logins review) | :heavy_check_mark: | `false` |
| `DISCORD_GUILD` | `discord.guild` | Discord guild | :heavy_check_mark: | (first guild available) |
| `DISCORD_CATEGORY` | `discord.category` | Category of channels on Discord | :heavy_check_mark: | `messenger` |
| `DISCORD_SHOW_USERNAME` | `discord.showUsername` | Enables showing Discord username in Facebook messages | :heavy_check_mark: | `true` |

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
- If this doesn't work, create new issue [here](https://github.com/Bjornskjald/messenger-discord/issues) with your error log
