import Config from './Config'
import fetch, { Response } from 'node-fetch'
import { YAMLConnections } from '../ConnectionsManager'
import { Session } from 'libfb'

function getURL (filename: string): string {
  const env = process.env.STORAGE_URL ?? ''
  return env + (env.endsWith('/') ? filename : '/' + filename)
}

async function getJSON (url: string): Promise<any> {
  const res = await fetch(url)
  return res.json()
}

async function postJSON (url: string, body: any): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
}

export default class RemoteConfig extends Config {
  url = getURL('config.json')
  connURL = getURL('connections.json')
  sessionURL = getURL('session.json')

  async load (): Promise<void> {
    const config = await getJSON(this.url)
    this._load(config)
  }

  async set (key: string, value: any): Promise<Response> {
    this._set(key, value)
    return postJSON(this.url, { [key]: value })
  }

  async loadConnections (): Promise<YAMLConnections> {
    return getJSON(this.connURL)
  }

  async saveConnections (connections: YAMLConnections): Promise<void> {
    await postJSON(this.connURL, connections)
  }

  async loadSession (): Promise<Session> {
    return getJSON(this.sessionURL)
  }

  async saveSession (session: Session): Promise<void> {
    await postJSON(this.sessionURL, session)
  }
}
