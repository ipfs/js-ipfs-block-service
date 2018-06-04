/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const Block = require('ipfs-block')
const _ = require('lodash')
const map = require('async/map')
const waterfall = require('async/waterfall')
const CID = require('cids')
const multihashing = require('multihashing-async')

const BlockService = require('../src')

module.exports = (repo) => {
  describe('block-service', () => {
    let bs
    let testBlocks

    before((done) => {
      bs = new BlockService(repo)

      const data = [
        Buffer.from('1'),
        Buffer.from('2'),
        Buffer.from('3'),
        Buffer.from('A random data block')
      ]

      map(data, (d, cb) => {
        multihashing(d, 'sha2-256', (err, hash) => {
          expect(err).to.not.exist()
          cb(null, new Block(d, new CID(hash)))
        })
      }, (err, blocks) => {
        expect(err).to.not.exist()
        testBlocks = blocks
        done()
      })
    })

    describe('fetch only from local Repo', () => {
      it('store and get a block', (done) => {
        const b = testBlocks[3]

        waterfall([
          (cb) => bs.put(b, cb),
          (cb) => bs.get(b.cid, cb),
          (res, cb) => {
            expect(res).to.eql(b)
            cb()
          }
        ], done)
      })

      it('get a non stored yet block', (done) => {
        const b = testBlocks[2]

        bs.get(b.cid, (err, block) => {
          expect(err).to.exist()
          expect(block).to.not.exist()
          done()
        })
      })

      it('store many blocks', (done) => {
        bs.putMany(testBlocks, done)
      })

      it('get many blocks through .get', (done) => {
        map(testBlocks, (b, cb) => bs.get(b.cid, cb), (err, blocks) => {
          expect(err).to.not.exist()
          expect(blocks).to.eql(testBlocks)
          done()
        })
      })

      it('get many blocks through .getMany', (done) => {
        map(testBlocks, (b, cb) => cb(null, b.cid), (err, cids) => {
          expect(err).to.not.exist()
          bs.getMany(cids, (err, _blocks) => {
            expect(err).to.not.exist()
            expect(testBlocks).to.eql(testBlocks)
            done()
          })
        })
      })

      it('delete a block', (done) => {
        const data = Buffer.from('Will not live that much')

        multihashing(data, 'sha2-256', (err, hash) => {
          expect(err).to.not.exist()
          const b = new Block(data, new CID(hash))

          waterfall([
            (cb) => bs.put(b, cb),
            (cb) => bs.delete(b.cid, cb),
            (cb) => bs._repo.blocks.has(b.cid, cb),
            (res, cb) => {
              expect(res).to.be.eql(false)
              cb()
            }
          ], done)
        })
      })

      it('stores and gets lots of blocks', function (done) {
        this.timeout(8 * 1000)

        const data = _.range(1000).map((i) => {
          return Buffer.from(`hello-${i}-${Math.random()}`)
        })

        map(data, (d, cb) => {
          multihashing(d, 'sha2-256', (err, hash) => {
            expect(err).to.not.exist()
            cb(null, new Block(d, new CID(hash)))
          })
        }, (err, blocks) => {
          expect(err).to.not.exist()
          bs.putMany(blocks, (err) => {
            expect(err).to.not.exist()

            map(blocks, (b, cb) => bs.get(b.cid, cb), (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.be.eql(blocks)
              done()
            })
          })
        })
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

      it('retrieves a block through bitswap', (done) => {
        // returns a block with a value equal to its key
        const bitswap = {
          get (cid, callback) {
            callback(null, new Block(Buffer.from('secret'), cid))
          }
        }

        bs.setExchange(bitswap)

        const data = Buffer.from('secret')

        waterfall([
          (cb) => multihashing(data, 'sha2-256', cb),
          (hash, cb) => bs.get(new CID(hash), cb),
          (block, cb) => {
            expect(block.data).to.be.eql(data)
            cb()
          }
        ], done)
      })

      it('puts the block through bitswap', (done) => {
        const puts = []
        const bitswap = {
          put (block, callback) {
            puts.push(block)
            callback()
          }
        }
        bs.setExchange(bitswap)

        const data = Buffer.from('secret sauce')

        waterfall([
          (cb) => multihashing(data, 'sha2-256', cb),
          (hash, cb) => bs.put(new Block(data, new CID(hash)), cb)
        ], (err) => {
          expect(err).to.not.exist()
          expect(puts).to.have.length(1)
          done()
        })
      })
    })
  })
}
