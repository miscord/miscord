import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

export default (file: string) => new Promise((resolve, reject) => {
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
