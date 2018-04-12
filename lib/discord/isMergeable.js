module.exports = (config, m, lastMessage, opts) => {
  // if...
  // embeds are enabled
  return !config.discord.noEmbeds &&

  // there's an embed in current message
  (m[0].embed || m[1].embed) &&

  // there is a "last message"
  lastMessage &&

  // the last message had embed
  lastMessage.embeds[0] &&

  // that embed had author
  lastMessage.embeds[0].author &&

  // last message's author is the same as current's
  lastMessage.embeds[0].author.name === (m[0].embed || m[1].embed).author.name &&

  // there was no picture in the embed
  !lastMessage.embeds[0].image &&

  // there were no attachments
  lastMessage.attachments.size === 0 &&

  // current message also has no attachmtents
  opts.message.attachments.length === 0
}
