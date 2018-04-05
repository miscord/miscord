var osMatch = navigator.platform.match(/(Win|Mac|Linux)/)
var os = (osMatch && osMatch[1]) || ''
var arch = navigator.userAgent.match(/x86_64|Win64|WOW64/) || navigator.cpuClass === 'x64' ? 'x64' : 'x86'

fetch('https://api.github.com/repos/Bjornskjald/miscord/releases/latest')
  .then(res => res.json())
  .then(res => res.assets
    .map(el => ({ url: el.browser_download_url, name: el.name.split('-') }))
    .map(el => ({ url: el.url, version: el.name[1], os: el.name[2], arch: el.name[3].includes('.') ? el.name[3].split('.')[0] : el.name[3] }))
    .find(el => (el.os === getFullOSName(os).toLowerCase() || el.os === os.toLowerCase()) && el.arch === arch)
  )
  .then(asset => {
    document.querySelector('#download').href = asset.url
    document.querySelector('#download').innerHTML = `Download Miscord ${asset.version} for ${getFullOSName(os)}${os !== 'Mac' ? ` (${asset.arch === 'x64' ? '64-bit' : '32-bit'})` : ``}`
  })

function getFullOSName (os) { switch (os) { case 'Win': return 'Windows'; case 'Mac': return 'macOS'; default: return 'Linux' } }