const { spawn } = require('child_process')
const { version } = require('../package.json')
const release = require('gh-release')

async function main () {
  console.log('Building miscord-win.exe...')
  await build('win-x64', 'win.exe')

  console.log('Building miscord-win32.exe...')
  await build('win-x86', 'win32.exe')

  console.log('Building miscord-linux...')
  await build('linux-x64', 'linux')

  console.log('Building miscord-linux32...')
  await build('linux-x86', 'linux32')

  console.log('Building miscord-mac...')
  await build('mac-x64', 'mac')
  release({
    auth: {
      token: process.env.GITHUB_TOKEN
    },
    owner: 'miscord',
    repo: 'miscord',
    tag_name: 'v' + version,
    target_commitish: 'master',
    name: version,
    assets: [
      'win.exe',
      'win32.exe',
      'linux',
      'linux32',
      'mac'
    ].map(name => `build/miscord-${name}`)
  }, (err, result) => {
    if (err) console.error(err)
    console.log(result)
    process.exit(0)
  })
}

async function build (nodeVersion, name) {
  await exec(`npx pkg -t latest-${nodeVersion} --public . -o ./build/miscord-${name}`)
}

function exec (command) {
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

main()
