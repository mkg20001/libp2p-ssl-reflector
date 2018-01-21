'use strict'

const {map} = require('async')
const debug = require('debug')
const log = debug('libp2p:ssl-reflector')

const EE = require('events').EventEmitter
const upath = require('upath')

const ConfigValidator = require('./validate-config')

class BasicReflector extends EE {
  constructor (opt) {
    super()
    this.opt = opt
    this.ipfs = opt.ipfs
    this.swarm = opt.swarm
    this.config = opt.config
    this.main = opt.main
  }
  _update (cert, priv) {

  }
}

class IPNSReflector extends BasicReflector {
  constructor (opt) {
    super(opt)
  }
  start () {

  }
  enable (cb) {
    const log = debug('libp2p:ssl-reflector:ipns:' + this.config.domain)
    log('resolve %s', this.config.domain)
    const {ipfs} = this

    function tryPath (path, cb) {
      log('trying: %s', path)
      ipfs.files.cat(path, (err, content) => {
        log('success? %s', !err, err || '')
        if (err) return cb(err)
        let metadata = JSON.parse(content)
        cb(null, path, metadata)
      })
    }

    function setupReflector (path, metadata, cb) {
      ConfigValidator.validate(metadata, (err, metadata) => {
        if (err) return cb(err)
      })
    }

    ipfs.name.resolve(this.config.domain, (err, resPath) => {
      log('resolved: %s', err || resPath)
      if (err) return cb(err)
      const paths = [upath.join(resPath, 'reflector.json'), upath.join(resPath, 'reflector/metadata.json')]
      function next () {
        tryPath(paths.shift(), (err, res) => {
          if (err) {
            if (paths.length) next()
            else cb(new Error('Cannot find reflector config in ' + resPath))
          } else {
            setupReflector(...res, cb)
          }
        })
      }
      next()
    })
  }
}

module.exports = class SSLReflector extends EE {
  constructor (config, swarm, ipfs) {
    super()
    this.config = config
    this.swarm = swarm
    this.ipfs = ipfs
    log('setting up reflector. config.length=%s, swarm=%s, ipfs=%s', config.length, Boolean(swarm), Boolean(ipfs))
  }
  _createReflector (Reflector, config) {
    const {ipfs, swarm} = this
    return new Reflector({ipfs, swarm, config, main: this})
  }
}
