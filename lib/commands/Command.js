class Command {
  constructor (opts, executor) {
    if (typeof opts === 'function') {
      this.executor = opts
      this.skipCheck = true
    } else {
      this.argc = opts.argc
      this.usage = opts.usage
      this.example = opts.example
      this.executor = executor
      this.allowMoreArguments = opts.allowMoreArguments || false
    }
  }

  run (argv) {
    if (!this.skipCheck && this.handleArgc(argv)) return
    this.executor(argv, (message, params) => discord.commandChannel.send(message, params))
  }

  handleArgc (argv) {
    if (argv.length === this.argc) return false
    if (argv.length > this.argc && this.allowMoreArguments) return false
    discord.commandChannel.send(`Too ${argv.length < this.argc ? 'few' : 'many'} arguments!
  Usage: ${this.usage}
  Example: ${this.example}`)
    return true
  }
}

module.exports = Command
