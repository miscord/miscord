import { MessageOptions, RichEmbed, TextChannel } from 'discord.js'
import { splitString } from '../utils'
import { TextBasedChannel } from '../types/TextBasedChannel'
import { reportError } from '../error'

type ReplyFunction = (messsage: string, params: MessageOptions | RichEmbed) => void

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

  async run (argv: string[], channel: TextBasedChannel): Promise<void> {
    const reply = await this.handler(argv, (message, params) => {
      Command.send(channel, message, params).catch(err => reportError(err))
    })
    if (reply) return Command.send(channel, reply)
  }

  private static async send (channel: TextBasedChannel, message: string | MessageOptions, params?: MessageOptions | RichEmbed): Promise<void> {
    if (typeof message === 'string') {
      const messageArray = splitString(message, 1000)
      for (const part of messageArray) await channel.send(part, params)
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
    this.allowMoreArguments = options.allowMoreArguments ?? false
  }

  async run (argv: string[], channel: TextChannel): Promise<void> {
    if (!this.skipCheck && this.handleArgc(argv, channel)) return
    return super.run(argv, channel)
  }

  handleArgc (argv: string[], channel: TextChannel): boolean {
    if (argv.length === this.argc) return false
    if (argv.length > this.argc && this.allowMoreArguments) return false
    channel.send(`Too ${argv.length < this.argc ? 'few' : 'many'} arguments!
  Usage: ${this.usage}
  Example: ${this.example}`)
      .catch(err => reportError(err))
    return true
  }
}
