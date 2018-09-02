const log = require('npmlog')
const { promisify } = require('util')

module.exports = async senderID => {
  if (messenger.senders.has(senderID)) {
    log.verbose('getSender', 'Messenger sender cached')
    return messenger.senders.get(senderID)
  } else {
    log.verbose('getSender', 'Getting sender from API')
    var senders = await promisify(messenger.client.getUserInfo)(senderID)
    messenger.senders.set(senderID, senders[senderID])
    return senders[senderID]
  }
}
