const { spawn } = require('child_process')
const { version } = require('../package.json')
const release = require('gh-release')

const files = [
  ['win-x64', 'win.exe'],
  ['win-x86', 'win32.exe'],
  ['linux-x64', 'linux'],
  ['linux-x86', 'linux32'],
  ['mac-x64', 'mac']
]

Promise.all(files.map(build)).then(() => {
  release({
    auth: {
      token: process.env.GITHUB_TOKEN
    },
    owner: 'miscord',
    repo: 'miscord',
    tag_name: 'v' + version,
    target_commitish: 'master',
    name: version,
    assets: files.map(t => `build/miscord-${t[1]}`)
  }, (err, result) => {
    if (err) console.error(err)
    console.log(result)
    process.exit(0)
  })
})

async function build (t) {
  await exec(`npx pkg -t latest-${t[0]} --public . -o ./build/miscord-${t[1]}`)
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
