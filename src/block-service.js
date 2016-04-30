'use strict'

const async = require('async')

// BlockService is a hybrid block datastore. It stores data in a local
// datastore and may retrieve data from a remote Exchange.
// It uses an internal `datastore.Datastore` instance to store values.
function BlockService (ipfsRepo, exchange) {
  this.addBlock = ipfsRepo.datastore.put

  this.addBlocks = (blocks, callback) => {
    if (!Array.isArray(blocks)) {
      return callback(new Error('expects an array of Blocks'))
    }

    async.eachLimit(blocks, 100, (block, next) => {
      this.addBlock(block, next)
    }, callback)
  }

  this.getBlock = ipfsRepo.datastore.get

  this.getBlocks = (multihashes, extension, callback) => {
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

  this.deleteBlock = ipfsRepo.datastore.delete

  this.deleteBlocks = (multihashes, extension, callback) => {
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

module.exports = BlockService
