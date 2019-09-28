import load from './load.js'
import api from '../../../js/api.js'

api.getConfig('discord')
  .then(config => load(config, 'discord.'))
