const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

module.exports = file => new Promise((resolve, reject) => {
  let gzFile = `${file}.gz`

  const filePath = path.resolve(file)
  const gzFilePath = path.resolve(gzFile)

  let gzip = zlib.createGzip()

  const inputStream = fs.createReadStream(filePath)
  const outStream = fs.createWriteStream(gzFilePath)

  inputStream.pipe(gzip).pipe(outStream)

  outStream.on('finish', () => {
    fs.unlinkSync(filePath)
    resolve()
  })
})
