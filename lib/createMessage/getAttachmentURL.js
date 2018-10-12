const { parse } = require('url')

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
      const url = parseStoryUrl(story)
      if (url.match(/http[s]?:\/\/(www.)?google\.[a-z.]{2,7}\/url\?/)) {
        const { query } = parse(url)
        return query.url || url
      }
      return url
    }
  }
  return messenger.client.getAttachmentURL(message.id, attach.id)
}

function parseStoryUrl (story) {
  const { query } = parse(story.url, true)
  if (story.url.includes('l.facebook.com/l.php')) {
    return query.u
  }
  if (story.url.startsWith('fbrpc:')) {
    return query.target_url
  }
  return story.url
}
