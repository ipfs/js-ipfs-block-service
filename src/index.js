'use strict'

const parallelLimit = require('run-parallel-limit')
const pull = require('pull-stream')

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

  put (block, callback) {
    callback = callback || (() => {})
    if (!block) {
      return callback(new Error('Missing block'))
    }

    pull(
      pull.values([
        block
      ]),
      this.putStream(),
      pull.onEnd(callback)
    )
  }

  putStream () {
    if (this.isOnline()) {
      return this._bitswap.putStream()
    }

    return pull(
      pull.map((block) => {
        return { data: block.data, key: block.key() }
      }),
      this._repo.blockstore.putStream()
    )
  }

  get (cid, callback) {
    pull(
      this.getStream(cid),
      pull.collect((err, result) => {
        if (err) {
          return callback(err)
        }
        callback(null, result[0])
      })
    )
  }

  getStream (cid) {
    if (this.isOnline()) {
      return this._bitswap.getStream(cid)
    }

    return this._repo.blockstore.getStream(cid.multihash)
  }

  delete (cids, callback) {
    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    parallelLimit(cids.map((cid) => (next) => {
      this._repo.blockstore.delete(cid.multihash, next)
    }), 100, callback)
  }
}
