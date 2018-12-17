const { parse } = require('url')
const log = logger.withScope('createMessage:getAttachmentURL')

module.exports = async (message, attach) => {
  if (attach.imageMetadata && attach.imageMetadata.rawImageURI) return attach.imageMetadata.rawImageURI
  if (attach.videoMetadata && attach.videoMetadata.videoUri) return attach.videoMetadata.videoUri
  if (attach.xmaGraphQL) {
    const parsed = JSON.parse(attach.xmaGraphQL)
    attach = parsed[Object.keys(parsed)[0]]
    const story = attach.story_attachment
    if (!story) return
    if (story.media) {
      const { media } = story
      if (media.playable_url) return media.playable_url
      if (media.image && media.image.uri) return media.image.uri
    }

    if (story.url) {
      const url = parseStoryUrl(story)
      if (url.match(/http[s]?:\/\/(www.)?google\.[a-z.]{2,7}\/url\?/)) {
        const { query } = parse(url)
        return query.url || url
      }
      return url
    }
    return
  }
  log.debug('URL not found in the attachment object, falling back to API')
  let url = await messenger.client.getAttachmentURL(message.id, attach.id)
  if (!url) {
    log.debug('Failed to get the URL, retrying...')
    url = await messenger.client.getAttachmentURL(message.id, attach.id)
  }
  return url
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
