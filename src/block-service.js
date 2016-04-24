'use strict'

const Block = require('./block')
const bl = require('bl')
const async = require('async')

// BlockService is a hybrid block datastore. It stores data in a local
// datastore and may retrieve data from a remote Exchange.
// It uses an internal `datastore.Datastore` instance to store values.
function BlockService (ipfsRepo, exchange) {
  this.addBlock = (block, callback) => {
    const ws = ipfsRepo.datastore.createWriteStream(block.key, block.extension)

    let done = false

    ws.write(block.data)

    ws.once('error', (err) => {
      done = true
      callback(err)
    })

    ws.once('finish', () => {
      if (!done) {
        // Important to note: Writing to a stream
        // isn't an atomic process, because streams can be
        // piped, and the finish of one only represents that
        // the data was buffered to the next one.
        // This is something known and 'accepted' on the
        // streams API, however, since we expose a callback
        // interface on BlockService and a streams one,
        // the users will expect for the callback to be fired
        // when the final write was concluded. We add a
        // timeout to ensure that.
        // TODO: Create an elegant way to understand when
        // the block was actually flushed to disk. This
        // means changing how the blob-stores and repo are
        // implemented.
        // One option, is polling till we check it
        // is written.
        setTimeout(callback, 150)
      }
    })
    ws.end()
  }

  this.addBlocks = (blocks, callback) => {
    if (!Array.isArray(blocks)) {
      return callback(new Error('expects an array of Blocks'))
    }

    async.each(blocks, (block, next) => {
      this.addBlock(block, next)
    }, callback)
  }

  this.getBlock = (multihash, extension, callback) => {
    if (typeof extension === 'function') {
      callback = extension
      extension = undefined
    }

    if (!multihash) {
      return callback(new Error('Invalid multihash'))
    }

    ipfsRepo.datastore.createReadStream(multihash, extension)
      .pipe(bl((err, data) => {
        if (err) { return callback(err) }
        callback(null, new Block(data, extension))
      }))
  }

  this.getBlocks = (multihashes, extension, callback) => {
    if (typeof extension === 'function') {
      callback = extension
      extension = undefined
    }

    if (!Array.isArray(multihashes)) {
      return callback(new Error('Invalid batch of multihashes'))
    }

    var results = {}

    async.each(multihashes, (multihash, next) => {
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

  this.deleteBlock = (multihash, extension, callback) => {
    if (typeof extension === 'function') {
      callback = extension
      extension = undefined
    }

    if (!multihash) {
      return callback(new Error('Invalid multihash'))
    }

    ipfsRepo.datastore.remove(multihash, extension, callback)
  }

  this.deleteBlocks = (multihashes, extension, callback) => {
    if (typeof extension === 'function') {
      callback = extension
      extension = undefined
    }

    if (!Array.isArray(multihashes)) {
      return callback(new Error('Invalid batch of multihashes'))
    }

    async.each(multihashes, (multihash, next) => {
      this.deleteBlock(multihash, extension, next)
    }, (err) => {
      callback(err)
    })
  }
}

module.exports = BlockService
