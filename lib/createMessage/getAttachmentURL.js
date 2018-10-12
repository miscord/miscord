module.exports = (message, attach) => {
  if (attach.imageMetadata && attach.imageMetadata.rawImageURI) return attach.imageMetadata.rawImageURI
  if (attach.videoMetadata && attach.videoMetadata.videoUri) return attach.videoMetadata.videoUri
  if (attach.xmaGraphQL) {
    const parsed = JSON.parse(attach.xmaGraphQL)
    attach = parsed[Object.keys(parsed)[0]]
    const story = attach.story_attachment
    if (!story) return
    if (story.media &&
        story.media.playable_url) return story.media.playable_url
    if (story.url) {
      if (story.url.includes('l.facebook.com/l.php')) return require('url').parse(story.url, true).query.u
      return story.url
    }
  }
  return messenger.client.getAttachmentURL(message.id, attach.id)
}
