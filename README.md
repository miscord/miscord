# messenger-discord
Facebook Messenger to Discord bridge for Node.js

### Environmental variables

| Variable | Description |
| --- | --- |
| `LOGIN` | Facebook username/email |
| `PASSWORD` | Facebook password |
| `DISCORD_TOKEN` | Discord app token |
| `FORCE_LOGIN` | Forces login in case of login approval (optional) |

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

Fill "config.json" with needed info.

**Docker install**
```bash
docker run -d -e LOGIN=facebook@username.or.email -e PASSWORD=yourfacebookpass -e DISCORD_TOKEN=token -e DISCORD_GUILD=nameofyourguild Bjornskjald/messenger-discord
```

**Usage**
```bash
npm start
```

The bot will automatically create channels corresponding to threads on Messenger, sending message to these channels will send it to Messenger
