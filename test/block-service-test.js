/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const Block = require('ipfs-block')
const _ = require('lodash')
const { collect } = require('streaming-iterables')
const CID = require('cids')
const multihashing = require('multihashing-async')

const BlockService = require('../src')

module.exports = (repo) => {
  describe('block-service', () => {
    let bs
    let testBlocks

    before(async () => {
      bs = new BlockService(repo)

      const data = [
        Buffer.from('1'),
        Buffer.from('2'),
        Buffer.from('3'),
        Buffer.from('A random data block')
      ]

      testBlocks = await Promise.all(data.map(async (d) => {
        const hash = await multihashing(d, 'sha2-256')
        return new Block(d, new CID(hash))
      }))
    })

    describe('fetch only from local Repo', () => {
      it('store and get a block', async () => {
        const b = testBlocks[3]

        await bs.put(b)
        const res = await bs.get(b.cid)
        expect(res).to.eql(b)
      })

      it('get a non stored yet block', async () => {
        const b = testBlocks[2]

        try {
          await bs.get(b.cid)
        } catch (err) {
          expect(err).to.exist()
        }
      })

      it('store many blocks', () => {
        return bs.putMany(testBlocks)
      })

      it('get many blocks through .get', async () => {
        const blocks = await Promise.all(testBlocks.map(b => bs.get(b.cid)))
        expect(blocks).to.eql(testBlocks)
      })

      it('get many blocks through .getMany', async () => {
        const cids = testBlocks.map(b => b.cid)
        const blocks = await collect(bs.getMany(cids))
        expect(blocks).to.eql(testBlocks)
      })

      it('delete a block', async () => {
        const data = Buffer.from('Will not live that much')

        const hash = await multihashing(data, 'sha2-256')
        const b = new Block(data, new CID(hash))

        await bs.put(b)
        await bs.delete(b.cid)
        const res = await bs._repo.blocks.has(b.cid)
        expect(res).to.be.eql(false)
      })

      it('does not delete a block it does not have', async () => {
        const data = Buffer.from('Will not live that much ' + Date.now())
        const cid = new CID(await multihashing(data, 'sha2-256'))

        await bs.delete(cid)
          .then(
            () => expect.fail('Should have thrown'),
            (err) => expect(err).to.have.property('code', 'ERR_BLOCK_NOT_FOUND')
          )
      })

      it('stores and gets lots of blocks', async function () {
        this.timeout(8 * 1000)

        const data = _.range(1000).map((i) => {
          return Buffer.from(`hello-${i}-${Math.random()}`)
        })

        const blocks = await Promise.all(data.map(async (d) => {
          const hash = await multihashing(d, 'sha2-256')
          return new Block(d, new CID(hash))
        }))

        await bs.putMany(blocks)

        const res = await Promise.all(blocks.map(b => bs.get(b.cid)))
        expect(res).to.be.eql(blocks)
      })

      it('sets and unsets exchange', () => {
        bs = new BlockService(repo)
        bs.setExchange({})
        expect(bs.hasExchange()).to.be.eql(true)
        bs.unsetExchange()
        expect(bs.hasExchange()).to.be.eql(false)
      })
    })

    describe('fetch through Bitswap (has exchange)', () => {
      beforeEach(() => {
        bs = new BlockService(repo)
      })

      it('hasExchange returns true when online', () => {
        bs.setExchange({})
        expect(bs.hasExchange()).to.be.eql(true)
      })

      it('retrieves a block through bitswap', async () => {
        // returns a block with a value equal to its key
        const bitswap = {
          get (cid) {
            return new Block(Buffer.from('secret'), cid)
          }
        }

        bs.setExchange(bitswap)

        const data = Buffer.from('secret')

        const hash = await multihashing(data, 'sha2-256')
        const block = await bs.get(new CID(hash))

        expect(block.data).to.be.eql(data)
      })

      it('puts the block through bitswap', async () => {
        const puts = []
        const bitswap = {
          put (block) {
            puts.push(block)
          }
        }
        bs.setExchange(bitswap)

        const data = Buffer.from('secret sauce')

        const hash = await multihashing(data, 'sha2-256')
        await bs.put(new Block(data, new CID(hash)))

        expect(puts).to.have.length(1)
      })
    })
  })
}
