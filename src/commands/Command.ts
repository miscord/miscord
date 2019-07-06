import { DMChannel, MessageOptions, RichEmbed, TextChannel } from 'discord.js'
import { splitString } from '../utils'
import { TextBasedChannel } from '../types/TextBasedChannel'

type ReplyFunction = (messsage: string, params: MessageOptions | RichEmbed) => Promise<void>

interface CommandOptions {
  argc: number
  usage: string
  example: string
  allowMoreArguments?: boolean
}
type CommandHandler = (argv: string[], reply: ReplyFunction) => Promise<string | void | MessageOptions> | string | void | MessageOptions

export default class Command {
  handler: CommandHandler

  constructor (handler: CommandHandler, options?: CommandOptions) {
    this.handler = handler
    if (options) return new ExtendedCommand(handler, options)
  }

  async run (argv: string[], channel: TextBasedChannel) {
    let reply = await this.handler(argv, (message, params) => this.send(channel, message, params))
    if (reply) return this.send(channel, reply)
  }

  private async send (channel: TextBasedChannel, message: string | MessageOptions, params?: MessageOptions | RichEmbed) {
    if (typeof message === 'string') {
      const messageArray = splitString(message, 1000)
      for (let part of messageArray) await channel.send(part, params)
    } else {
      await channel.send(message, params)
    }
  }
}

export class ExtendedCommand extends Command {
  skipCheck: boolean = false
  argc: number = 0
  usage: string = ''
  example: string = ''
  allowMoreArguments: boolean = false

  constructor (handler: CommandHandler, options: CommandOptions) {
    super(handler)
    this.argc = options.argc
    this.usage = options.usage
    this.example = options.example
    this.allowMoreArguments = options.allowMoreArguments || false
  }

  async run (argv: string[], channel: TextChannel) {
    if (!this.skipCheck && this.handleArgc(argv, channel)) return
    return super.run(argv, channel)
  }

  handleArgc (argv: string[], channel: TextChannel) {
    if (argv.length === this.argc) return false
    if (argv.length > this.argc && this.allowMoreArguments) return false
    channel.send(`Too ${argv.length < this.argc ? 'few' : 'many'} arguments!
  Usage: ${this.usage}
  Example: ${this.example}`)
    return true
  }
}
