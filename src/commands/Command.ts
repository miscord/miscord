import { Message, MessageOptions, RichEmbed, TextChannel } from 'discord.js'

type ReplyFunction = (messsage: string, params: MessageOptions | RichEmbed) => Promise<Message | Message[]>

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

  async run (argv: string[], channel: TextChannel) {
    let reply = await this.handler(argv, (message, params) => channel.send(message, params))
    if (reply) channel.send(reply)
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
