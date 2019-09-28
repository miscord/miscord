const log = logger.withScope('downloadFile')

import fs from 'fs-extra'
import url from 'url'
import path from 'path'
import tmp from 'tmp'
import http from 'http'
import https from 'https'

export default async (attachURL: string) => {
  log.debug('Downloading a file from URL:', attachURL)

  const tempdir = tmp.dirSync().name
  await fs.ensureDir(tempdir)

  const filePath = await download(tempdir, attachURL)
  log.debug('Downloaded file path:', filePath)

  const extension = path.parse(filePath).ext
  log.debug('File extension:', extension)

  return { filePath, extension }
}

async function download (dir: string, attachURL: string) {
  let filePath = path.join(dir, url.parse(attachURL).pathname!!.split('/').slice(-1).pop()!!)
  log.debug('Download target:', filePath)
  while (fs.existsSync(filePath)) {
    const parsed = path.parse(filePath)
    if (/^.*\d$/.test(parsed.name)) {
      let [, text, digits] = Array.from(parsed.name.match(/^(.*?)(\d+)$/)!!)
      parsed.name = text + (Number(digits) + 1)
    } else {
      parsed.name = parsed.name + '1'
    }
    filePath = path.join(parsed.dir, parsed.name + parsed.ext)
    log.debug('Target already exists, new path:', filePath)
  }
  const fileStream = fs.createWriteStream(filePath)
  const stream = await new Promise((resolve, reject) => {
    const cb = (res: http.IncomingMessage) => resolve(res)
    if (url.parse(attachURL).protocol === 'https:') {
      https.get(attachURL, cb)
    } else {
      http.get(attachURL, cb)
    }
  }) as http.IncomingMessage
  await new Promise((resolve, reject) => stream.pipe(fileStream).on('finish', resolve))
  return path.resolve(filePath)
}
