# messenger-discord
Facebook Messenger to Discord bridge

### Environmental variables

| Variable | Description |
| --- | --- |
| `LOGIN` | Facebook username/email |
| `PASSWORD` | Facebook password |
| `DISCORD_TOKEN` | Discord app token |

### Setup

Create new Discord application [here](https://discordapp.com/developers/applications/me)

Add "app bot user" to your application. Save the token somewhere safe

Copy this link to your browser: https://discordapp.com/oauth2/authorize?scope=bot&permissions=0&client_id={CLIENT_ID}

Replace {CLIENT_ID} with your own client ID

Add your bot to chosen guild


### Usage

```bash
node login.js # this will save your Facebook session to appstate.json

node index.js name_of_your_guild # name may be empty, bot will use first guild from the list
```

The bot will automatically create channels corresponding to threads on Messenger, sending message to these channels will send it to Messenger