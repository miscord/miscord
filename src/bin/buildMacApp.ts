import fs from 'fs-extra'
import path from 'path'
import fetch from 'node-fetch'
import archiver from 'archiver'
import extractZip from 'extract-zip'
import tmp from 'tmp'

export default async function buildMacApp (version: string): Promise<void> {
  // create a temporary directory
  const tmpdir = tmp.dirSync()
  const tmppath = (p: string): string => path.join(tmpdir.name, p)

  // get path to the zip file which will be downloaded
  const zipPath = tmppath('miscord.zip')

  // download the template app from GitHub
  await download('https://github.com/miscord/macos-wrapper/releases/download/v1.0.1/Miscord.zip', zipPath)

  // extract it to the temporary directory
  await extract(zipPath, { dir: tmpdir.name })

  // delete the zip file
  await fs.remove(zipPath)

  // copy the zipped binary
  await fs.copyFile(`build/miscord-${version}-mac.zip`, tmppath('miscord-mac.zip'))

  // extract the binary
  await extract(tmppath('miscord-mac.zip'), { dir: tmpdir.name })

  // fill the template with a binary
  await fs.copyFile(tmppath(`miscord-${version}-mac.bin`), tmppath('Miscord.app/Contents/Resources/miscord-mac.bin'))

  // create a zip file
  await archivize(zipPath, tmppath('Miscord.app'))

  // copy the zip file to the build folder
  await fs.copyFile(zipPath, `build/miscord-${version}-macapp.zip`)

  // delete the temporary directory
  await fs.remove(tmpdir.name)
}

const extract = (path: string, opts: extractZip.Options): Promise<void> => new Promise(
  (resolve, reject) => extractZip(path, opts, err => { if (err) reject(err); else resolve() })
)

const download = (url: string, path: string): Promise<void> => new Promise((resolve, reject) => {
  const stream = fs.createWriteStream(path)
  fetch(url)
    .then(res => res.body.pipe(stream))
    .catch(reject)
  stream.on('close', resolve)
})

const archivize = (filePath: string, directory: string): Promise<void> => new Promise((resolve, reject) => {
  const stream = fs.createWriteStream(filePath)
  stream.on('close', resolve)
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })
  archive.pipe(stream)
  archive.directory(directory, path.parse(directory).base)
  archive.finalize()
    .catch(reject)
})
