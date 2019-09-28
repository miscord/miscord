import { Client, User } from 'libfb'
import Thread from './Thread'
import FakeClient from '../dummy/messenger'

export default interface MessengerGlobal {
  client: Client | FakeClient
  threads: Map<string, Thread>
  senders: Map<string, User>
}
