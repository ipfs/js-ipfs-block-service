'use strict'
const Block = require('./block')
const bl = require('bl')
const async = require('async')

// BlockService is a hybrid block datastore. It stores data in a local
// datastore and may retrieve data from a remote Exchange.
// It uses an internal `datastore.Datastore` instance to store values.
function BlockService (ipfsRepo, exchange) {
  this.addBlock = (block, callback) => {
    const ws = ipfsRepo.datastore.createWriteStream(block.key)
    ws.write(block.data)
    ws.on('finish', callback)
    ws.end()
  }

  this.addBlocks = (blocks, callback) => {
    if (!Array.isArray(blocks)) {
      return callback(new Error('expects an array of Blocks'))
    }

    async.each(blocks, (block, next) => {
      this.addBlock(block, next)
    }, (err) => {
      callback(err)
    })
  }

  this.getBlock = (multihash, callback) => {
    if (!multihash) {
      return callback(new Error('Invalid multihash'))
    }

    ipfsRepo.datastore.createReadStream(multihash)
      .pipe(bl((err, data) => {
        if (err) { return callback(err) }
        callback(null, new Block(data))
      }))
  }

  this.getBlocks = (multihashes, callback) => {
    if (!Array.isArray(multihashes)) {
      return callback(new Error('Invalid batch of multihashes'))
    }

    const blocks = []

    async.each(multihashes, (multihash, next) => {
      this.getBlock(multihash, (err, block) => {
        if (err) { return next(err) }
        blocks.push(block)
      })
    }, (err) => {
      callback(err, blocks)
    })
  }

  this.deleteBlock = (multihash, callback) => {
    if (!multihash) {
      return callback(new Error('Invalid multihash'))
    }

    ipfsRepo.datastore.remove(multihash, callback)
  }

  this.deleteBlocks = (multihashes, callback) => {
    if (!Array.isArray(multihashes)) {
      return callback('Invalid batch of multihashes')
    }

    async.each(multihashes, (multihash, next) => {
      this.deleteBlock(multihash, next)
    }, (err) => {
      callback(err)
    })
  }
}

module.exports = BlockService
