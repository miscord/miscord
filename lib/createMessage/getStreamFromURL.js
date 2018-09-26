const fs = require('fs')
const url = require('url')
const path = require('path')
const log = logger.withScope('getStreamFromURL')

module.exports = async attachURL => {
  log.debug('Getting stream from URL:', attachURL)

  const tempdir = require('path').join(config.path, 'temp')
  require('mkdirp').sync(tempdir, err => { if (err) throw err })

  const filePath = await download(tempdir, attachURL)
  const stream = fs.createReadStream(filePath)
  stream.on('close', () => fs.unlink(filePath, err => { if (err) throw err }))
  return stream
}

async function download (dir, attachURL) {
  let filePath = path.join(dir, url.parse(attachURL).pathname.split('/').slice(-1).pop())
  while (fs.existsSync(filePath)) {
    const parsed = path.parse(filePath)
    filePath = path.join(parsed.dir, parsed.name + '1' + parsed.ext)
  }
  const fileStream = fs.createWriteStream(filePath)
  const stream = await new Promise((resolve, reject) => require(url.parse(attachURL).protocol.replace(':', '')).get(attachURL, res => resolve(res)))
  await new Promise((resolve, reject) => stream.pipe(fileStream).on('finish', resolve))
  return filePath
}
