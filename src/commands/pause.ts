import Command from './Command'

export default new Command(() => {
  if (config.paused) return 'Already paused!'

  config.paused = true
  return 'Paused!'
})
