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
    if (story.target && story.target.__type__ && story.target.__type__.name === 'MessageLocation') {
      return {
        textContent: cleanURL(story.url)
      }
    }
    if (story.media) {
      const { media } = story
      if (media.playable_url) return media.playable_url
      if (media.image && media.image.uri) return media.image.uri
    }

    if (story.url) {
      return cleanURL(story.url)
    }
    return
  }
  log.debug('URL not found in the attachment object, falling back to API')
  let url
  try {
    url = await messenger.client.getAttachmentURL(message.id, attach.id)
  } catch (err) {
    log.warn(err)
    log.warn('Failed to get the URL, retrying...')
    url = await messenger.client.getAttachmentURL(message.id, attach.id)
  }
  if (!url) log.fatal(`Could not get an URL for attachment ${attach.id}`)
  return url
}

function cleanURL (url) {
  let query
  ({ query } = parse(url, true))
  if (url.startsWith('https:\\/\\/')) {
    const vm = require('vm')
    const context = vm.createContext()
    url = vm.runInContext(url, context)
    ;({ query } = parse(url, true))
  }
  if (url.startsWith('fbrpc:')) {
    url = query.target_url
    ;({ query } = parse(url, true))
  }
  if (url.includes('l.facebook.com/l.php')) {
    url = query.u
    ;({ query } = parse(url, true))
  }
  if (url.match(/http[s]?:\/\/(www.)?google\.[a-z.]{2,7}\/url\?/)) {
    url = query.url || url
    ;({ query } = parse(url, true))
  }
  return url
}
