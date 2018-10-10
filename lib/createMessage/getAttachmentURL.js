module.exports = (message, attach) => {
  if (attach.imageMetadata && attach.imageMetadata.rawImageURI) return attach.imageMetadata.rawImageURI
  if (attach.videoMetadata && attach.videoMetadata.videoUri) return attach.videoMetadata.videoUri
  if (attach.xmaGraphQL) {
    const parsed = JSON.parse(attach.xmaGraphQL)
    attach = parsed[Object.keys(parsed)[0]]
    if (attach.story_attachment &&
        attach.story_attachment.media &&
        attach.story_attachment.media.playable_url) return attach.story_attachment.media.playable_url
  }
  return messenger.client.getAttachmentURL(message.id, attach.id)
}
