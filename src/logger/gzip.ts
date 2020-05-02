import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

export default async function gzip (file: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const gzFile = `${file}.gz`

    const filePath = path.resolve(file)
    const gzFilePath = path.resolve(gzFile)

    const gzip = zlib.createGzip()

    const inputStream = fs.createReadStream(filePath)
    const outStream = fs.createWriteStream(gzFilePath)

    inputStream.pipe(gzip).pipe(outStream)

    outStream.on('finish', () => {
      fs.unlinkSync(filePath)
      resolve()
    })
  })
}
