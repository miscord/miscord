const log = logger.withScope('messenger:getSender')

export default async (senderID: string) => {
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
