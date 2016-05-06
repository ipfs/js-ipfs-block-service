'use strict'

const async = require('async')

// BlockService is a hybrid block datastore. It stores data in a local
// datastore and may retrieve data from a remote Exchange.
// It uses an internal `datastore.Datastore` instance to store values.
module.exports = class BlockService {
  constructor (ipfsRepo) {
    this._repo = ipfsRepo
    this._bitswap = null
  }

  goOnline (bitswap) {
    this._bitswap = bitswap
  }

  isOnline () {
    return this._bitswap != null
  }

  addBlock (block, extension, callback) {
    if (this.isOnline()) {
      if (typeof extension === 'function') {
        callback = extension
        extension = undefined
      }

      this._bitswap.hasBlock(block, callback)
    } else {
      this._repo.datastore.put(block, extension, callback)
    }
  }

  addBlocks (blocks, callback) {
    if (!Array.isArray(blocks)) {
      return callback(new Error('expects an array of Blocks'))
    }

    async.eachLimit(blocks, 100, (block, next) => {
      this.addBlock(block, next)
    }, callback)
  }

  getBlock (key, extension, callback) {
    if (this.isOnline()) {
      if (typeof extension === 'function') {
        callback = extension
        extension = undefined
      }

      this._bitswap.getBlock(key, callback)
    } else {
      this._repo.datastore.get(key, extension, callback)
    }
  }

  getBlocks (multihashes, extension, callback) {
    if (typeof extension === 'function') {
      callback = extension
      extension = undefined
    }

    if (!Array.isArray(multihashes)) {
      return callback(new Error('Invalid batch of multihashes'))
    }

    var results = {}

    async.eachLimit(multihashes, 100, (multihash, next) => {
      this.getBlock(multihash, extension, (err, block) => {
        results[multihash] = {
          err: err,
          block: block
        }
        next()
      })
    }, (err) => {
      callback(err, results)
    })
  }

  deleteBlock (key, extension, callback) {
    this._repo.datastore.delete(key, extension, callback)
  }

  deleteBlocks (multihashes, extension, callback) {
    if (typeof extension === 'function') {
      callback = extension
      extension = undefined
    }

    if (!Array.isArray(multihashes)) {
      return callback(new Error('Invalid batch of multihashes'))
    }

    async.eachLimit(multihashes, 100, (multihash, next) => {
      this.deleteBlock(multihash, extension, next)
    }, (err) => {
      callback(err)
    })
  }
}
