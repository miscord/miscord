import { Client, User } from 'libfb'
import Thread from './Thread'

export default interface MessengerGlobal {
  client: Client
  threads: Map<string, Thread>
  senders: Map<string, User>
}
