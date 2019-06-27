import path from 'path'
import gzip from './gzip'
import { getConfigDir } from '../config/FileConfig'
import fs from 'fs-extra'

export default async (configPath: string = getConfigDir()) => {
  logger.start('Compressing old logs...')
  let files
  try {
    files = await fs.readdir(path.join(configPath, 'logs'))
    await files
      .filter(file => file.endsWith('.log'))
      .map(file => path.join(configPath, 'logs', file))
      .reduce((promise, item) => promise.then(() => { gzip(item) }), Promise.resolve())
      .then(() => logger.success('All old logs compressed, starting Miscord'))
  } catch (err) {
    logger.debug(err)
    logger.debug('Error occured during compressing logs, starting Miscord')
  }
}
