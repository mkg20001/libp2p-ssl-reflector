'use strict'

// const {map} = require('async')
const debug = require('debug')
const log = debug('libp2p:ssl-reflector')

const EE = require('events').EventEmitter
const upath = require('upath')

const ConfigValidator = require('./validate-config')

const Peer = require('peer-info')
const Id = require('peer-id')

function resolveDNS (ma, dnsconf) {
  const type = ma.split('/')[1]
  const addr = ma.split('/')[2]
  const pattern = dnsconf.pattern[type]
  let ip = addr
  if (!pattern) return false
  for (const key in dnsconf.replace) {
    ip = ip.replace(new RegExp(key, 'g'), dnsconf.replace[key]) // TODO: redos fix
  }
  let dns = pattern.replace('${ADDRESS}', ip)
  return '/dns' + type.split('').pop() + '/' + dns
}

function buildPeerInfo (obj) {
  const peer = new Peer(Id.createFromB58String(obj.id))
  obj.addr.forEach(addr => peer.multiaddrs.add(addr))
  return peer
}

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
    this.log = debug('libp2p:ssl-reflector:ipns:' + this.config.domain)
  }
  start () {

  }
  enable (cb) {
    const {ipfs, log} = this

    log('resolve %s', this.config.domain)

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
    log('setting up reflectors. config.length=%s, swarm=%s, ipfs=%s', config.length, Boolean(swarm), Boolean(ipfs))
  }
  _createReflector (Reflector, config) {
    const {ipfs, swarm} = this
    return new Reflector({ipfs, swarm, config, main: this})
  }
}
