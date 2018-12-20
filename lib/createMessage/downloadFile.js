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

  const stream = fs.createReadStream(filePath)
  log.trace('Read stream:', stream)

  const extension = path.parse(filePath).ext
  log.debug('File extension:', extension)

  stream.on('close', () => fs.unlink(filePath, err => { if (err) throw err }))
  return { stream, extension }
}

async function download (dir, attachURL) {
  let filePath = path.join(dir, url.parse(attachURL).pathname.split('/').slice(-1).pop())
  log.debug('Download target:', filePath)
  while (fs.existsSync(filePath)) {
    const parsed = path.parse(filePath)
    filePath = path.join(parsed.dir, parsed.name + '1' + parsed.ext)
    log.debug('Target already exists, new path:', filePath)
  }
  const fileStream = fs.createWriteStream(filePath)
  const stream = await new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
  await new Promise((resolve, reject) => stream.pipe(fileStream).on('finish', resolve))
  return filePath
}
