import Command from './Command'

export default new Command(() => {
  if (!config.paused) return 'Not paused!'

  config.paused = false
  return 'Unpaused!'
})
