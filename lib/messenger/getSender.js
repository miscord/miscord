const log = require('npmlog')
const { promisify } = require('util')

module.exports = async (config, senderID) => {
  if (config.messenger.senders.has(senderID)) {
    log.verbose('getSender', 'Messenger sender cached')
    return config.messenger.senders.get(senderID)
  } else {
    log.verbose('getSender', 'Getting sender from API')
    var senders = await promisify(config.messenger.client.getUserInfo)(senderID)
    config.messenger.senders.set(senderID, senders[senderID])
    return senders[senderID]
  }
}
