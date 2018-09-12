/* global fetch */
const getFullOSName = os => ({Win: 'Windows', Mac: 'macOS'}[os]) || 'Linux'
const download = document.querySelector('#download')
var osMatch = navigator.platform.match(/(Win|Mac|Linux)/)
var os = (osMatch && osMatch[1]) || ''
var arch = navigator.userAgent.match(/x86_64|Win64|WOW64/) || navigator.cpuClass === 'x64' ? 'x64' : 'x86'

fetch('https://api.github.com/repos/Bjornskjald/miscord/releases/latest')
  .then(res => res.json())
  .then(res => (os === 'Mac' || arch === 'x64') ? res : { assets: [] })
  .then(release => release.assets
    .map(el => ({ url: el.browser_download_url, os: el.name.split('.')[0].replace('miscord-', ''), version: release.name }))
    .find(el => (el.os === getFullOSName(os).toLowerCase() || el.os === os.toLowerCase()))
  )
  .then(asset => {
    download.href = asset.url
    download.innerHTML = `Download Miscord ${asset.version} for ${getFullOSName(os)}`
  })
