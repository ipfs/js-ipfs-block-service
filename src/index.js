'use strict'

const { map } = require('streaming-iterables')

/**
 * BlockService is a hybrid block datastore. It stores data in a local
 * datastore and may retrieve data from a remote Exchange.
 * It uses an internal `datastore.Datastore` instance to store values.
 */
class BlockService {
  /**
   * Create a new BlockService
   *
   * @param {IPFSRepo} ipfsRepo
   */
  constructor (ipfsRepo, decider) {
    this._repo = ipfsRepo
    this._bitswap = null
    this._decider = decider
  }

  /**
   * Add a bitswap instance that communicates with the
   * network to retreive blocks that are not in the local store.
   *
   * If the node is online all requests for blocks first
   * check locally and afterwards ask the network for the blocks.
   *
   * @param {Bitswap} bitswap
   * @returns {void}
   */
  setExchange (bitswap) {
    this._bitswap = bitswap
  }

  /**
   * Go offline, i.e. drop the reference to bitswap.
   *
   * @returns {void}
   */
  unsetExchange () {
    this._bitswap = null
  }

  /**
   * Is the blockservice online, i.e. is bitswap present.
   *
   * @returns {bool}
   */
  hasExchange () {
    return this._bitswap != null
  }

  /**
   * Put a block to the underlying datastore.
   *
   * @param {Block} block
   * @returns {Promise}
   */
  async put (block) {
    if (this._decider && await !this._decider(block)) return
    if (this.hasExchange()) {
      return this._bitswap.put(block)
    } else {
      return this._repo.blocks.put(block)
    }
  }

  /**
   * Put a multiple blocks to the underlying datastore.
   *
   * @param {Array<Block>} blocks
   * @returns {Promise}
   */
  async putMany (blocks) {
    if (this._decider) {
      blocks = blocks.map(b => this._decider(b).then(allowed => allowed ? block : null))
      blocks = (await Promise.all(blocks)).filter(x => x)
    }
    if (this.hasExchange()) {
      return this._bitswap.putMany(blocks)
    } else {
      return this._repo.blocks.putMany(blocks)
    }
  }

  /**
   * Get a block by cid.
   *
   * @param {CID} cid
   * @returns {Promise<Block>}
   */
  get (cid) {
    if (this._decider && !this._decider(cid)) throw new Error("Self-care error, this block is bad for you") 
    if (this.hasExchange()) {
      return this._bitswap.get(cid)
    } else {
      return this._repo.blocks.get(cid)
    }
  }

  /**
   * Get multiple blocks back from an array of cids.
   *
   * @param {Array<CID>} cids
   * @returns {Iterator<Block>}
   */
  getMany (cids) {
    if (!Array.isArray(cids)) {
      throw new Error('first arg must be an array of cids')
    }

    if (this.hasExchange()) {
      return this._bitswap.getMany(cids)
    } else {
      const getRepoBlocks = map((cid) => this._repo.blocks.get(cid))
      return getRepoBlocks(cids)
    }
  }

  /**
   * Delete a block from the blockstore.
   *
   * @param {CID} cid
   * @returns {Promise}
   */
  delete (cid) {
    return this._repo.blocks.delete(cid)
  }
}

module.exports = BlockService
