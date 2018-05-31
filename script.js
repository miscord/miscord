const download = document.querySelector('#download')
var osMatch = navigator.platform.match(/(Win|Mac|Linux)/)
var os = (osMatch && osMatch[1]) || ''
var arch = navigator.userAgent.match(/x86_64|Win64|WOW64/) || navigator.cpuClass === 'x64' ? 'x64' : 'x86'

fetch('https://api.github.com/repos/Bjornskjald/miscord/releases/latest')
  .then(res => res.json())
  .then(res => res.assets
    .map(el => ({ url: el.browser_download_url, name: el.name.split('.').slice(0, 3).join('.').split('-') }))
    .map(el => ({ url: el.url, version: el.name[1], os: el.name[2], arch: os === 'Mac' ? 'x64' : el.name[3] }))
    .find(el => (el.os === getFullOSName(os).toLowerCase() || el.os === os.toLowerCase()) && os === 'Mac' ? true : el.arch === arch)
  )
  .then(asset => {
    download.href = asset.url
    download.innerHTML = `Download Miscord ${asset.version} for ${getFullOSName(os)}${getArchName(os, asset.arch)}`
  })

function getArchName (os, arch) { return os === 'Mac' ? '' : arch === 'x64' ? ' (64-bit)' : ' (32-bit)' }
function getFullOSName (os) { return {Win: 'Windows', Mac: 'macOS'}[os] || 'Linux' }