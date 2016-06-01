'use strict'

const parallelLimit = require('run-parallel-limit')
const mh = require('multihashes')

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

  goOffline () {
    this._bitswap = null
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

    parallelLimit(blocks.map((block) => (next) => {
      this.addBlock(block, next)
    }), 100, callback)
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

    if (this.isOnline()) {
      this._bitswap.getBlocks(multihashes, (results) => {
        callback(null, results)
      })
      return
    }

    const results = {}
    parallelLimit(multihashes.map((key) => (next) => {
      this._repo.datastore.get(key, extension, (error, block) => {
        results[mh.toB58String(key)] = {error, block}
        next()
      })
    }), 100, (err) => {
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

    parallelLimit(multihashes.map((multihash) => (next) => {
      this.deleteBlock(multihash, extension, next)
    }), 100, (err) => {
      callback(err)
    })
  }
}
