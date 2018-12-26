const log = logger.withScope('messenger:getSender')

module.exports = async senderID => {
  if (typeof senderID === 'string') senderID = Number(senderID)
  if (messenger.senders.has(senderID)) {
    log.debug('Messenger sender cached')
    return messenger.senders.get(senderID)
  } else {
    log.debug('Getting sender from API')
    const sender = await messenger.client.getUserInfo(senderID)
    messenger.senders.set(senderID, sender)
    return sender
  }
}
