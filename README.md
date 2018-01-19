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

Install Node.js - download [here](https://nodejs.org/en/download/)

### Usage

*If you don't know what Docker is, use "Local install"*

**Local install**
```bash
git clone https://github.com/Bjornskjald/messenger-discord # or download a zip from GitHub repo and extract it to folder of your choice
cd messenger-discord # if you download the zip you might need to provide a full path, like C:\Users\User\Downloads\messenger-discord
npm install
```

**Docker install**
```bash
docker run -d -e LOGIN=facebook@username.or.email -e PASSWORD=yourfacebookpass -e DISCORD_TOKEN=token Bjornskjald/messenger-discord
```

**Setup**

| Windows | Linux |
| ------- | ----- |
|<pre>set DISCORD_TOKEN=place_your_token_here<br />set LOGIN=facebook@username.or.email<br />set PASSWORD=yourfacebookpass</pre>|<pre>DISCORD_TOKEN=place_your_token_here<br />LOGIN=facebook@username.or.email<br />PASSWORD=yourfacebookpass</pre>|

**Usage**
```bash
node login.js # this will save your Facebook session to appstate.json

node index.js name_of_your_guild # name may be empty, bot will use first guild from the list
```

The bot will automatically create channels corresponding to threads on Messenger, sending message to these channels will send it to Messenger
