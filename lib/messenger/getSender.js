const log = logger.withScope('messenger:getSender')

module.exports = async senderID => {
  if (messenger.senders.has(senderID)) {
    log.debug('Messenger sender cached')
    return messenger.senders.get(senderID)
  } else {
    log.debug('Getting sender from API')
    const senders = await messenger.client.getUserInfo(senderID)
    messenger.senders.set(senderID, senders[senderID])
    return senders[senderID]
  }
}
