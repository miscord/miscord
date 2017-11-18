# messenger-discord
Facebook Messenger to Discord bridge

### Environmental variables

| Variable | Description |
| --- | --- |
| `LOGIN` | Facebook username/email |
| `PASSWORD` | Facebook password |
| `DISCORD_TOKEN` | Discord app token |

### Usage

```bash
node index.js name_of_your_guild
```

The bot will automatically create channels corresponding to threads on Messenger, sending message to these channels will send it to Messenger