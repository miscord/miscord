import path from 'path'
import { getConfigDir } from '../config/FileConfig'
import strip from 'strip-ansi'
import fs from 'fs-extra'
import isDocker from 'is-docker'
import timezonedDate from './timezonedDate'

type WriteFunction = (str: string, encoding?: string, cb?: (err?: Error | null) => void) => boolean

class FakeWriteStream {
  end (cb?: () => void): void { if (cb) cb() }
  write (str: string, encoding?: any, cb?: (err?: Error | null) => void): boolean {
    return true
  }
}

const getWritableDate = () => timezonedDate().replace('T', '_').replace(/:/g, '-')

export default (configPath = getConfigDir()) => {
  let logStream: fs.WriteStream | FakeWriteStream
  if (process.env.STORAGE_URL) {
    logStream = new FakeWriteStream()
  } else {
    const dir = path.join(configPath, 'logs')
    fs.ensureDirSync(dir)

    const filename = getWritableDate() + '.log'
    logStream = fs.createWriteStream(path.join(dir, filename))
  }

  let line = ''

  // https://gist.github.com/pguillory/729616/32aa9dd5b5881f6f2719db835424a7cb96dfdfd6
  function bindWrite (write: WriteFunction, stream: 'stdout' | 'stderr') {
    return (str: string, encoding: string, fd: any) => {
      if (str.startsWith('close')) {
        const match = str.match(/close (\d+)/)
        if (match) {
          const code = parseInt(match[1], 10)
          return logStream.end(() => process.exit(code))
        }
      }
      line += str
      if (!str.includes('\n')) return
      write.call(process[stream], isDocker() ? strip(line) : line, encoding, fd)
      logStream.write(strip(line), encoding, fd)
      line = ''
    }
  }
  // @ts-ignore
  process.stdout.write = bindWrite(process.stdout.write, 'stdout')
  // @ts-ignore
  process.stderr.write = bindWrite(process.stderr.write, 'stderr')
}
