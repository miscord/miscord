# messenger-discord
Facebook Messenger to Discord bridge

### Environmental variables

| Variable | Description |
| --- | --- |
| `LOGIN` | Facebook username/email |
| `PASSWORD` | Facebook password |
| `DISCORD_TOKEN` | Discord app token |

### Installing

**Local install**
```bash
git clone https://github.com/Bjornskjald/messenger-discord
cd messenger-discord
```

**Docker install**
```bash
docker run -d -e LOGIN=facebook@username.or.email -e PASSWORD=yourfacebookpass -e DISCORD_TOKEN=token Bjornskjald/messenger-discord
```

### Setup


Create new Discord application [here](https://discordapp.com/developers/applications/me)

Click "new app", choose a name for your application, confirm by clicking "create app"

Add "bot user" to your application

Open "OAuth URL Generator", choose scope "bot" and copy link to your browser

Add your bot to chosen guild


### Usage

```bash
node login.js # this will save your Facebook session to appstate.json

node index.js name_of_your_guild # name may be empty, bot will use first guild from the list
```

The bot will automatically create channels corresponding to threads on Messenger, sending message to these channels will send it to Messenger
