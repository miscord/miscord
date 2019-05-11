import { spawn } from 'child_process'
import release from 'gh-release'
import path from 'path'
import archiver from 'archiver'
import fs from 'fs-extra'
import buildMacApp from './buildMacApp'

const { version } = require('../../package.json')

async function main () {
  console.log(`Building miscord-${version}-win.exe...`)
  await build('win-x64', 'win.exe')

  console.log(`Building miscord-${version}-win32.exe...`)
  await build('win-x86', 'win32.exe')

  console.log(`Building miscord-${version}-linux.bin...`)
  await build('linux-x64', 'linux.bin')

  console.log(`Building miscord-${version}-linux32.bin...`)
  await build('linux-x86', 'linux32.bin')

  console.log(`Building miscord-${version}-mac.bin...`)
  await build('mac-x64', 'mac.bin')

  console.log(`Building miscord-${version}-mac.zip...`)
  await buildMacApp(version)

  release({
    auth: {
      token: process.env.GITHUB_TOKEN!!
    },
    owner: 'miscord',
    repo: 'miscord',
    tag_name: 'v' + version,
    target_commitish: 'master',
    name: version,
    assets: [
      'win',
      'win32',
      'linux',
      'linux32',
      'mac',
      'macapp'
    ].map(platform => `build/miscord-${version}-${platform}.zip`)
  }, (err, result) => {
    if (err) console.error(err)
    console.log(result)
    process.exit(0)
  })
}

async function build (nodeVersion: string, name: string) {
  const filename = `miscord-${version}-${name}`
  await exec(`npx pkg -t latest-${nodeVersion} --public . -o ./build/${filename}`)
  await archivize(filename)
  await fs.remove(path.join('build', filename))
}

function exec (command: string) {
  return new Promise((resolve, reject) => {
    const child = spawn('/bin/bash', ['-c', command], { cwd: require('path').join(__dirname, '..'), env: process.env })
    child.stdout.on('data', data => process.stdout.write(data))
    child.stderr.on('data', data => process.stderr.write(data))
    child.on('error', err => {
      console.error(err)
      process.exit(1)
    })
    child.on('close', () => resolve())
  })
}

const archivize = (file: string) => new Promise((resolve, reject) => {
  const { name, base } = path.parse(file)
  const stream = fs.createWriteStream(path.join('build', name + '.zip'))
  stream.on('close', resolve)
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  })
  archive.pipe(stream)
  archive.append(fs.createReadStream(path.join('build', file)), { name: base, mode: 0o755 })
  archive.finalize()
})

main()
