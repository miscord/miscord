import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import isDocker from 'is-docker'
import yaml from 'js-yaml'
import Config from './Config'
import { YAMLConnections } from '../ConnectionsManager'
import diff from './diff'
import defaultConfig from './defaultConfig'
import { Session } from 'libfb'
import SetupServer from '../api/setup'
import { reportError } from '../error'

const log = logger.withScope('FileConfig')

export default class FileConfig extends Config {
  path: string
  connPath: string
  sessionPath: string

  constructor (dataPath = getConfigDir()) {
    super()
    dataPath = path.resolve(dataPath)
    this.path = path.join(dataPath, 'config.json')
    this.connPath = path.join(dataPath, 'connections.yml')
    this.sessionPath = path.join(dataPath, 'session.json')
  }

  async load (): Promise<void> {
    if (!fs.existsSync(this.path)) {
      const server = new SetupServer()
      server.run()
      return new Promise(resolve => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        server.once('config', async config => {
          await fs.ensureFile(this.path)
          await fs.writeJSON(this.path, config, { spaces: 2 })
          await fs.writeJSON(this.sessionPath, server.messengerSession, { spaces: 2 })
          this._load(config)
          await server.stop()
          resolve()
        })
      })
    }

    log.info(`Loading config from ${this.path}`)
    const config = await fs.readJSON(this.path)
    this._load(config)
  }

  set (key: string, value: string): void {
    this._set(key, value)
    this.save()
      .catch(err => reportError(err))
  }

  async save (): Promise<void> {
    let config = JSON.parse(JSON.stringify(this.config))
    config = Object.fromEntries(
      Object.entries(config)
        .map(([ key, value ]) => {
          if (typeof value === 'object' && defaultConfig[key]) {
            return [ key, diff(defaultConfig[key], value) ]
          }
          return [ key, value ]
        })
    )
    await fs.writeJSON(this.path, config, { spaces: 2 })
  }

  async loadConnections (): Promise<YAMLConnections> {
    const file = await fs.readFile(this.connPath, 'utf8')
    return yaml.safeLoad(file) as YAMLConnections
  }

  async saveConnections (connections: YAMLConnections): Promise<void> {
    return fs.writeFile(this.connPath, yaml.safeDump(connections), 'utf8')
  }

  async loadSession (): Promise<Session> {
    return fs.readJSON(this.sessionPath)
  }

  async saveSession (session: Session): Promise<void> {
    return fs.writeJSON(this.sessionPath, session)
  }
}
export function getConfigDir (): string {
  if (isDocker()) return '/config'
  switch (process.platform) {
    case 'win32':
      return path.join(process.env.APPDATA ?? 'C:\\', 'Miscord')
    case 'linux':
      return path.join(os.homedir(), '.config', 'Miscord')
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Miscord')
    default:
      return path.join(os.homedir(), '.miscord')
  }
}
