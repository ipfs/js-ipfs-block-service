'use strict'

const parallelLimit = require('async/parallelLimit')
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

  // Note: we have to pass the CID, so that bitswap can then use it for
  // the smart selectors. For now, passing the CID is used so that we know
  // the right multihash, this means that now we have multiple hashes official
  // support \o/
  put (blockAndCID, callback) {
    callback = callback || (() => {})
    if (!blockAndCID) {
      return callback(new Error('Missing block and CID'))
    }

    pull(
      pull.values([
        blockAndCID
      ]),
      this.putStream(),
      pull.onEnd(callback)
    )
  }

  putStream () {
    if (this.isOnline()) {
      return this._bitswap.putStream()
    } else {
      return pull(
        pull.map((blockAndCID) => {
          return {
            data: blockAndCID.block.data,
            key: blockAndCID.cid.multihash
          }
        }),
        this._repo.blockstore.putStream()
      )
    }
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
