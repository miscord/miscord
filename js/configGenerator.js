/* global alert, FileReader, self, btoa */
const getElement = e => document.querySelector(e)
const v = (value, defaultValue) => value === defaultValue ? undefined : value
const style = {
  setDanger: el => { el.classList.remove('is-info'); el.classList.add('is-danger') },
  setInfo: el => { el.classList.remove('is-danger'); el.classList.add('is-info') }
}
const proxyHandler = {
  get: (target, name) => {
    console.log({target, name})
    if (['messenger', 'discord'].includes(name)) return new Proxy({name}, proxyHandler)

    const element = document.querySelector(`#${target.name}-${name}`)

    if (element && element.type === 'checkbox') return element.checked
    else if (name === 'filter') {
      return (filter => {
        if (!filter) return
        var obj = {}
        var type = getElement('#messenger-list-type').value
        obj[type] = filter.split('\n')
        obj[type === 'whitelist' ? 'blacklist' : 'whitelist'] = []
        return obj
      })(element.value)
    } else if (name === 'sourceFormat') {
      return (format => (format.discord || format.messenger) ? { discord: v(format.discord, ''), messenger: v(format.messenger, '') } : undefined)({
        discord: getElement('#messenger-sourceFormat-discord').value,
        messenger: getElement('#messenger-sourceFormat-messenger').value
      })
    } else return element.value
  },
  set: (target, name, input) => {
    console.log({target, name, input})
    if (['messenger', 'discord'].includes(name)) return new Proxy({name}, proxyHandler)

    const element = document.querySelector(`#${target.name}-${name}`)

    if (!element) return

    if (element.type === 'checkbox') element.checked = input
    else if (name === 'filter') {
      getElement('#messenger-list-type').value = input.whitelist.length > 0 ? 'whitelist' : 'blacklist'
      return (input.whitelist.length > 0 ? input.whitelist : input.blacklist).join('\n')
    } else if (name === 'sourceFormat') {
      getElement('#messenger-sourceFormat-discord').value = input.discord
      getElement('#messenger-sourceFormat-messenger').value = input.messenger
    } else element.value = input
  }
}

const form = new Proxy({name: 'miscord'}, proxyHandler)

// ELEMENTS
var upload = getElement('#config-upload')
var uploadWrapper = getElement('#upload-wrapper')

// BUTTONS
getElement('#generate-config').addEventListener('click', e => { getElement('#output').innerHTML = generateConfig() })
getElement('#download-config').addEventListener('click', e => downloadData(generateConfig(), 'config.json'))

upload.addEventListener('change', e => {
  if (upload.files.length === 0) return
  var file = upload.files[0]

  style.setInfo(uploadWrapper)
  uploadWrapper.classList.add('has-name')

  var filename = getElement('#filename')
  filename.style.visibility = 'visible'
  filename.innerHTML = file.name

  if (!file.name.endsWith('.json')) return style.setDanger(uploadWrapper)

  var reader = new FileReader()
  reader.readAsText(file)
  reader.addEventListener('load', ev => {
    var content = ev.target.result
    if (!content || !content.length) return
    try {
      return handleUpload(JSON.parse(content))
    } catch (err) {
      console.error(err)
      return style.setDanger(uploadWrapper)
    }
  })
})

function handleUpload (config) {
  for (var key in config) {
    if (key === 'messenger' || key === 'discord') {
      for (let vkey in config[key]) form[key][vkey] = config[key][vkey]
    } else form[key] = config[key]
  }
}

function generateConfig () {
  if (!form.messenger.username) return alert('Messenger username missing!') || ''
  if (!form.messenger.password) return alert('Messenger password missing!') || ''
  if (!form.discord.token) return alert('Discord token missing!') || ''

  var config = {
    logLevel: v(form.logLevel, 'info'),
    checkUpdates: v(form.checkUpdates, false),
    errorChannel: v(form.errorChannel, ''),
    commandChannel: v(form.commandChannel, ''),
    messenger: {
      username: form.messenger.username,
      password: form.messenger.password,
      forceLogin: v(form.messenger.forceLogin, true),
      filter: form.messenger.filter,
      format: v(form.messenger.format, ''),
      sourceFormat: form.messenger.sourceFormat,
      ignoreEmbeds: v(form.messenger.ignoreEmbeds, false)
    },
    discord: {
      token: form.discord.token,
      guild: v(form.discord.guild, ''),
      category: v(form.discord.category, ''),
      renameChannels: v(form.discord.renameChannels, true),
      showEvents: v(form.discord.showEvents, false),
      showFullNames: v(form.discord.showFullNames, false),
      createChannels: v(form.discord.createChannels, false),
      massMentions: v(form.discord.massMentions, true)
    }
  }

  return JSON.stringify(config, null, 2)
}
function downloadData (data, name) {
  var ev = document.createEvent('MouseEvents')
  ev.initMouseEvent('click', true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  var a = document.createElement('a')
  a.download = name
  a.href = 'data:application/octet-stream;base64,' + btoa(data)
  a.dispatchEvent(ev)
}
