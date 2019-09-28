import load from './load.js'
import api from '../../../js/api.js'

api.getConfig()
  .then(config => load(config, ''))
