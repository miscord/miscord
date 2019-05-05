import Config from './Config'
import fetch from 'node-fetch'
import { YAMLConnections } from '../ConnectionsManager'
import { Session } from 'libfb'

function getURL (filename: string) {
  let env = process.env.STORAGE_URL!!
  return env + env.endsWith('/') ? filename : '/' + filename
}

async function getJSON (url: string) {
  const res = await fetch(url)
  return res.json()
}

function postJSON (url: string, body: any) {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

export default class RemoteConfig extends Config {
  url = getURL('Config.ts.ts.json')
  connURL = getURL('connections.json')
  sessionURL = getURL('session.json')

  async load () {
    const config = await getJSON(this.url)
    this._load(config)
  }

  set (key: string, value: any) {
    this._set(key, value)
    return postJSON(this.url, { [key]: value })
  }

  loadConnections () { return getJSON(this.connURL) }
  async saveConnections (connections: YAMLConnections) { postJSON(this.connURL, connections) }

  loadSession () { return getJSON(this.sessionURL) }
  async saveSession (session: Session) { postJSON(this.sessionURL, session) }
}
