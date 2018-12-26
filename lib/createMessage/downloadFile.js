const fs = require('fs-extra')
const url = require('url')
const path = require('path')
const log = logger.withScope('downloadFile')

module.exports = async attachURL => {
  log.debug('Downloading a file from URL:', attachURL)

  const tempdir = require('path').join(config.path, 'temp')
  await fs.ensureDir(tempdir)

  const filePath = await download(tempdir, attachURL)
  log.debug('Downloaded file path:', filePath)

  const extension = path.parse(filePath).ext
  log.debug('File extension:', extension)

  return { filePath, extension }
}

async function download (dir, attachURL) {
  let filePath = path.join(dir, url.parse(attachURL).pathname.split('/').slice(-1).pop())
  log.debug('Download target:', filePath)
  while (fs.existsSync(filePath)) {
    const parsed = path.parse(filePath)
    if (/^.*\d$/.test(parsed.name)) {
      let [, text, digits] = parsed.name.match(/^(.*?)(\d+)$/)
      parsed.name = text + (Number(digits) + 1)
    } else {
      parsed.name = parsed.name + '1'
    }
    filePath = path.join(parsed.dir, parsed.name + parsed.ext)
    log.debug('Target already exists, new path:', filePath)
  }
  const fileStream = fs.createWriteStream(filePath)
  const stream = await new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
  await new Promise((resolve, reject) => stream.pipe(fileStream).on('finish', resolve))
  return path.resolve(filePath)
}
