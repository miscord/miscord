/* global alert, FileReader, self, btoa */
import defaultConfig from './defaultConfig.js'
const categories = ['messenger', 'discord', 'timestamps', 'channels']
const getElement = e => document.querySelector(e)
const v = (value, defaultValue) => value === defaultValue ? undefined : value
const style = {
  setDanger: el => { el.classList.remove('is-info'); el.classList.add('is-danger') },
  setInfo: el => { el.classList.remove('is-danger'); el.classList.add('is-info') }
}
const proxyHandler = {
  get: (target, name) => {
    console.log({ target, name })
    if (categories.includes(name)) return new Proxy({ name }, proxyHandler)

    console.log(`Querying #${target.name}-${name}`)
    const element = document.querySelector(`#${target.name}-${name}`)

    if (element && element.type === 'checkbox') return element.checked
    else if (name === 'whitelist') return element.value.split('\n').map(el => el.trim()).filter(e => e)
    else if (name === 'sourceFormat') {
      return (format => (format.discord || format.messenger) ? { discord: v(format.discord, ''), messenger: v(format.messenger, '') } : undefined)({
        discord: getElement('#messenger-sourceFormat-discord').value,
        messenger: getElement('#messenger-sourceFormat-messenger').value
      })
    } else return element.value
  },
  set: (target, name, input) => {
    console.log({ target, name, input })
    if (categories.includes(name)) return new Proxy({ name }, proxyHandler)

    const element = document.querySelector(`#${target.name}-${name}`)

    if (!element) return

    if (element.type === 'checkbox') element.checked = input
    else if (name === 'whitelist') return input.join('\n')
    else if (name === 'sourceFormat') {
      getElement('#messenger-sourceFormat-discord').value = input.discord
      getElement('#messenger-sourceFormat-messenger').value = input.messenger
    } else element.value = input
  }
}

const form = new Proxy({ name: 'miscord' }, proxyHandler)

// ELEMENTS
const upload = getElement('#config-upload')
const uploadWrapper = getElement('#upload-wrapper')

// BUTTONS
getElement('#generate-config').addEventListener('click', e => { getElement('#output').innerHTML = generateConfig() })
getElement('#download-config').addEventListener('click', e => downloadData(generateConfig(), 'config.json'))

upload.addEventListener('change', e => {
  if (upload.files.length === 0) return
  const file = upload.files[0]

  style.setInfo(uploadWrapper)
  uploadWrapper.classList.add('has-name')

  const filename = getElement('#filename')
  filename.style.visibility = 'visible'
  filename.innerHTML = file.name

  if (!file.name.endsWith('.json')) return style.setDanger(uploadWrapper)

  readFile(file)
})

function handleUpload (config) {
  for (const key in config) {
    if (categories.includes(key)) for (const vkey in config[key]) form[key][vkey] = config[key][vkey]
    else form[key] = config[key]
  }
}

function generateConfig () {
  if (!form.messenger.username) return alert('Messenger username missing!') || ''
  if (!form.messenger.password) return alert('Messenger password missing!') || ''
  if (!form.discord.token) return alert('Discord token missing!') || ''

  const config = {}

  for (const key in defaultConfig) {
    console.log(key)
    if (categories.includes(key)) {
      config[key] = {}
      for (const vkey in defaultConfig[key]) {
        if (vkey === 'whitelist' && !form[key][vkey].length) continue
        if (defaultConfig[key][vkey] !== form[key][vkey]) config[key][vkey] = form[key][vkey]
      }
    } else if (defaultConfig[key] !== form[key]) config[key] = form[key]
  }

  return JSON.stringify(config, null, 2)
}
function downloadData (data, name) {
  const ev = document.createEvent('MouseEvents')
  ev.initMouseEvent('click', true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  const a = document.createElement('a')
  a.download = name
  a.href = 'data:application/octet-stream;base64,' + btoa(data)
  a.dispatchEvent(ev)
}
function readFile (file) {
  const reader = new FileReader()
  reader.readAsText(file)
  reader.addEventListener('load', ev => {
    const content = ev.target.result
    if (!content || !content.length) return
    try {
      return handleUpload(JSON.parse(content))
    } catch (err) {
      console.error(err)
      return style.setDanger(uploadWrapper)
    }
  })
}
