import { Thread as LibfbThread } from 'libfb'

export default interface Thread extends LibfbThread {
  cleanName: string
}
