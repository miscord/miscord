import load from './load.js'
import api from '../../../js/api.js'

api.getConfig('messenger')
  .then(config => load(config, 'messenger.'))
