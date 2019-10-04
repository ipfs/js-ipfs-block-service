'use strict'

const { map } = require('streaming-iterables')
const errcode = require('err-code')

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
  constructor (ipfsRepo) {
    this._repo = ipfsRepo
    this._bitswap = null
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
  put (block) {
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
  putMany (blocks) {
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
  async delete (cid) {
    if (!await this._repo.blocks.has(cid)) {
      throw errcode(new Error('blockstore: block not found'), 'ERR_BLOCK_NOT_FOUND')
    }

    return this._repo.blocks.delete(cid)
  }
}

module.exports = BlockService
