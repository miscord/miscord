// CONSTANTS
const getElement = e => document.querySelector(e)
const v = (value, defaultValue) => value === defaultValue ? undefined : value
const style = {
  setDanger: el => { el.classList.remove('is-info'); el.classList.add('is-danger') },
  setInfo: el => { el.classList.remove('is-danger'); el.classList.add('is-info') }
}
const form = {
  get logLevel() { return getElement('#miscord-logLevel').value },
  set logLevel(val) { getElement('#miscord-logLevel').value = val },

  get checkUpdates() { return getElement('#miscord-checkUpdates').checked },
  set checkUpdates(val) { getElement('#miscord-checkUpdates').checked = val },

  get ownerID() { return getElement('#miscord-ownerID').value },
  set ownerID(val) { getElement('#miscord-ownerID').value = val },

  messenger: {
    get username () { return getElement('#messenger-username').value },
    set username(val) { getElement('#messenger-username').value = val },

    get password() { return getElement('#messenger-password').value },
    set password(val) { getElement('#messenger-password').value = val },

    get forceLogin() { return getElement('#messenger-forceLogin').checked },
    set forceLogin(val) { getElement('#messenger-forceLogin').checked = val },

    get filter() { return getElement('#messenger-filter').value },
    set filter(val) { getElement('#messenger-filter').value = handle.filter(val) },

    get format() { return getElement('#messenger-format').value },
    set format(val) { getElement('#messenger-format').value = val },

    get sourceFormat() { return {
      discord: getElement('#messenger-sourceFormat-discord').value,
      messenger: getElement('#messenger-sourceFormat-messenger').value
    }},
    set sourceFormat(val) {
      getElement('#messenger-sourceFormat-discord').value = val.discord
      getElement('#messenger-sourceFormat-messenger').value = val.messenger
    },

    get ignoreEmbeds() { return getElement('#messenger-ignoreEmbeds').checked },
    set ignoreEmbeds(val) { getElement('#messenger-ignoreEmbeds').checked = val }
  },

  discord: {
    get token() { return getElement('#discord-token').value },
    set token(val) { getElement('#discord-token').value = val },

    get guild() { return getElement('#discord-guild').value },
    set guild(val) { getElement('#discord-guild').value = val },

    get category() { return getElement('#discord-category').value },
    set category(val) { getElement('#discord-category').value = val },

    get renameChannels() { return getElement('#discord-renameChannels').checked },
    set renameChannels(val) { getElement('#discord-renameChannels').checked = val },

    get showEvents() { return getElement('#discord-showEvents').checked },
    set showEvents(val) { getElement('#discord-showEvents').checked = val },

    get showFullNames() { return getElement('#discord-showFullNames').checked },
    set showFullNames(val) { getElement('#discord-showFullNames').checked = val },

    get createChannels() { return getElement('#discord-createChannels').checked },
    set createChannels(val) { getElement('#discord-createChannels').checked = val },

    get massMentions() { return getElement('#discord-massMentions').checked },
    set massMentions(val) { getElement('#discord-massMentions').checked = val }
  }
}

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
    checkUpdates: v(form.checkUpdates, true),
    ownerID: v(form.ownerID, ''),
    messenger: {
      username: form.messenger.username,
      password: form.messenger.password,
      forceLogin: v(form.messenger.forceLogin, false),
      filter: parse.filter(form.messenger.filter),
      format: v(form.messenger.format, ''),
      sourceFormat: parse.sourceFormat(form.messenger.sourceFormat),
      ignoreEmbeds: v(form.messenger.ignoreEmbeds, false)
    },
    discord: {
      token: form.discord.token,
      guild: v(form.discord.guild, ''),
      category: v(form.discord.category, ''),
      renameChannels: v(form.discord.renameChannels, true),
      showEvents: v(form.discord.showEvents, false),
      showFullNames: v(form.discord.showFullNames, false),
      createChannels: v(form.discord.showFullNames, true),
      massMentions: v(form.discord.showFullNames, true)
    }
  }

  return JSON.stringify(config, null, 2)
}
const parse = {
  filter: filter => {
    if (!filter) return undefined
    var obj = {}
    var type = getElement('#messenger-list-type').value
    obj[type] = filter.split('\n')
    obj[type === 'whitelist' ? 'blacklist' : 'whitelist'] = []
    return obj
  },
  sourceFormat: format => (format.discord || format.messenger) ? { discord: v(format.discord, ''),	messenger: v(format.messenger, '') } : undefined
}
const handle = {
  filter: list => {
    getElement('#messenger-list-type').value = list.whitelist.length > 0 ? 'whitelist' : 'blacklist'
    return (list.whitelist.length > 0 ? list.whitelist : list.blacklist).join('\n')
  },
  sourceFormat: format => {
    form.messenger.sourceFormat.discord = format.discord
    form.messenger.sourceFormat.messenger = format.messenger
  }
}
function downloadData (data, name) {
  var ev = document.createEvent("MouseEvents")
  ev.initMouseEvent("click", true, false, self, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
  var a = document.createElement('a')
  a.download = name
  a.href = 'data:application/octet-stream;base64,' + btoa(data)
  a.dispatchEvent(ev)
}