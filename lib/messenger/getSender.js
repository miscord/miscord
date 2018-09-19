const log = logger.withScope('messenger:getSender')
const { promisify } = require('util')

module.exports = async senderID => {
  if (messenger.senders.has(senderID)) {
    log.debug('Messenger sender cached')
    return messenger.senders.get(senderID)
  } else {
    log.debug('Getting sender from API')
    var senders = await promisify(messenger.client.getUserInfo)(senderID)
    messenger.senders.set(senderID, senders[senderID])
    return senders[senderID]
  }
}
