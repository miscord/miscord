module.exports = {
  fromMessenger: {
    discord: require('./fromMessenger.discord'),
    messenger: require('./fromMessenger.messenger')
  },
  fromDiscord: {
    discord: require('./fromDiscord.discord'),
    messenger: require('./fromDiscord.messenger')
  }
}
