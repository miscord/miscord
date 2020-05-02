import dotProp from 'dot-prop'
import { Session } from 'libfb'
import { YAMLConnections } from '../ConnectionsManager'
import defaultConfig from './defaultConfig'
import mergeDeep from './mergeDeep'
import { Level } from '../logger/Logger'

export default abstract class Config {
  config: any = defaultConfig
  paused: boolean = false

  static proxify (config: any): any {
    return new Proxy(config, {
      get: (target, name, receiver) => Reflect.get(target, name, receiver) || Reflect.get(target.config, name, receiver)
    })
  }

  _load (config: any): void {
    this.config = mergeDeep(this.config, config)
    logger.setLevel(process.env.MISCORD_LOG_LEVEL as Level || this.config.logLevel as Level || 'info')
  }

  _set (key: string, value: any): void {
    if (value == null) {
      dotProp.delete(this.config, key)
    } else {
      dotProp.set(this.config, key, value)
    }
  }

  abstract set (key: string, value: any): void

  validate (): void {
    if (!this.config.discord.token || !this.config.messenger.username || !this.config.messenger.password) {
      if (process.pkg && process.platform === 'win32') {
        logger.fatal('Token/username/password not found.')
        process.stdin.resume()
        return
      }
      throw new Error('Token/username/password not found.')
    }
  }

  abstract async loadConnections (): Promise<YAMLConnections>
  abstract async saveConnections (connections: YAMLConnections): Promise<void>
  abstract async loadSession (): Promise<Session>
  abstract async saveSession (session: Session): Promise<void>
}
