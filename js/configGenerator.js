/* global alert, FileReader, self, btoa */
import defaultConfig from './defaultConfig.js'
const $ = e => document.querySelector(e)
const isEmpty = val => ['{}', '[]'].includes(JSON.stringify(val))
const isObject = val => typeof val === 'object' && !Array.isArray(val)
const setNestedProp = (target, ...a) => {
  let source = form
  if (Array.isArray(a)) {
    while (a.length > 1) {
      let key = a.shift()
      target = target[key]
      source = source[key]
    }
    a = a[0]
  }
  target[a] = source[a]
}
const style = {
  setDanger: el => { el.classList.remove('is-info'); el.classList.add('is-danger') },
  setInfo: el => { el.classList.remove('is-danger'); el.classList.add('is-info') }
}
const proxyHandler = {
  get: (parent, name) => {
    console.log(`${parent.name}-${name}`)
    if (isObject(parent.default[name])) {
      return new Proxy({
        name: parent.name === 'miscord' ? name : parent.name + '-' + name,
        default: parent.default[name]
      }, proxyHandler)
    }

    const element = $(`#${parent.name}-${name}`)
    if (!element) return null

    let value

    if (element.type === 'checkbox') value = element.checked
    else if (element.type === 'textarea') value = element.value.split('\n').map(el => el.trim()).filter(e => e)
    else value = element.value

    if (typeof value === 'boolean') return value !== parent.default[name] ? value : undefined
    return (value !== '' && value !== parent.default[name]) ? value : undefined
  },
  set: (parent, name, input) => {
    console.log(`${parent.name}-${name}`, input)
    console.log('isObject:', parent.default[name], isObject(parent.default[name]))
    if (isObject(parent.default[name])) return new Proxy({ name }, proxyHandler)

    const element = $(`#${parent.name}-${name}`)
    if (!element) return true
    if (input === parent.default[name]) return true

    if (element.type === 'checkbox') element.checked = input
    else if (element.type === 'textarea') element.value = input.join('\n')
    else element.value = input
    return true
  }
}

const form = new Proxy({ name: 'miscord', default: defaultConfig }, proxyHandler)

// ELEMENTS
const upload = $('#config-upload')
const uploadWrapper = $('#upload-wrapper')

// BUTTONS
$('#generate-config').addEventListener('click', e => { $('#output').innerHTML = generateConfig() })
$('#download-config').addEventListener('click', e => downloadData(generateConfig(), 'config.json'))

upload.addEventListener('change', e => {
  if (upload.files.length === 0) return
  const file = upload.files[0]

  style.setInfo(uploadWrapper)
  uploadWrapper.classList.add('has-name')

  const filename = $('#filename')
  filename.style.visibility = 'visible'
  filename.innerHTML = file.name

  if (!file.name.endsWith('.json')) return style.setDanger(uploadWrapper)

  readFile(file)
})

function handleUpload (config) {
  for (const key in config) {
    if (isObject(config[key])) {
      for (const vkey in config[key]) {
        if (isObject(config[key][vkey])) for (const vvkey in config[key][vkey]) form[key][vkey][vvkey] = config[key][vkey][vvkey]
        else form[key][vkey] = config[key][vkey]
      }
    } else form[key] = config[key]
  }
}

function generateConfig () {
  if (!form.messenger.username) return alert('Messenger username missing!') || ''
  if (!form.messenger.password) return alert('Messenger password missing!') || ''
  if (!form.discord.token) return alert('Discord token missing!') || ''

  const config = {}

  for (const key in defaultConfig) {
    if (isObject(defaultConfig[key])) {
      config[key] = {}
      for (const vkey in defaultConfig[key]) {
        if (isObject(defaultConfig[key][vkey])) {
          config[key][vkey] = {}
          for (const vvkey in defaultConfig[key][vkey]) setNestedProp(config, key, vkey, vvkey)
          // i have no idea where did vkey come from but vvkey looks cool
        } else setNestedProp(config, key, vkey)
        if (isEmpty(config[key][vkey])) delete config[key][vkey]
      }
    } else setNestedProp(config, key)
    if (isEmpty(config[key])) delete config[key]
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
