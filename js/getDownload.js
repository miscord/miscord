/* global fetch, platform */
const download = document.querySelector('#download')

const { family } = platform.os
const arch = family !== 'OS X' ? platform.os.architecture : 64
const os = family.startsWith('Windows') ? (arch === 64 ? 'win' : 'win32') : family === 'OS X' ? 'macapp' : arch === 64 ? 'linux' : 'linux32'
const longOS = family.startsWith('Windows') ? 'Windows' : family === 'OS X' ? 'macOS' : 'Linux'

fetch('https://api.github.com/repositories/111148687/releases/latest')
  .then(res => res.json())
  .then(release => release.assets
    .map(el => ({ url: el.browser_download_url, os: el.name.split('-')[2].split('.')[0], version: release.name }))
    .map(el => console.log(el) || el)
    .find(el => el.os === os)
  )
  .then(asset => {
    if (['Android', 'iOS', 'Windows Phone', 'Tizen', 'Symbian OS', 'FreeBSD'].includes(platform.os.family)) return
    download.href = asset.url
    download.innerHTML = `Download Miscord ${asset.version} for ${longOS}`
  })
