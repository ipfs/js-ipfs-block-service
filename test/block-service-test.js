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

    before(() => {
      bs = new BlockService(repo)
    })

    describe('offline', () => {
      it('store and get a block', (done) => {
        const data = new Buffer('A random data block')
        multihashing(data, 'sha2-256', (err, hash) => {
          expect(err).to.not.exist()
          const b = new Block(data, new CID(hash))

          waterfall([
            (cb) => bs.put(b, cb),
            (cb) => bs.get(b.cid, cb),
            (res, cb) => {
              expect(res).to.be.eql(b)
              cb()
            }
          ], done)
        })
      })

      it('get a non existent block', (done) => {
        const data = new Buffer('Not stored')

        multihashing(data, 'sha2-256', (err, hash) => {
          expect(err).to.not.exist()
          bs.get(new CID(hash), (err, block) => {
            expect(err).to.exist()
            expect(block).to.not.exist()
            done()
          })
        })
      })

      it('store many blocks', (done) => {
        const data = [new Buffer('1'), new Buffer('2'), new Buffer('3')]
        map(data, (d, cb) => {
          multihashing(d, 'sha2-256', (err, hash) => {
            expect(err).to.not.exist()
            cb(null, new Block(d, new CID(hash)))
          })
        }, (err, blocks) => {
          expect(err).to.not.exist()
          bs.putMany(blocks, done)
        })
      })

      it('get many blocks', (done) => {
        const data = [new Buffer('1'), new Buffer('2'), new Buffer('3')]
        waterfall([
          (cb) => map(data, (d, cb) => {
            multihashing(d, 'sha2-256', (err, hash) => {
              expect(err).to.not.exist()
              cb(null, new Block(d, new CID(hash)))
            })
          }, cb),
          (blocks, cb) => map(
            blocks,
            (b, cb) => bs.get(b.cid, cb),
            (err, res) => {
              expect(err).to.not.exist()
              expect(res).to.be.eql(blocks)
              cb()
            }
          )
        ], done)
      })

      it('delete a block', (done) => {
        const data = new Buffer('Will not live that much')
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

      it('stores and gets lots of blocks', (done) => {
        const data = _.range(1000).map((i) => {
          return new Buffer(`hello-${i}-${Math.random()}`)
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

      it('goes offline', () => {
        bs = new BlockService(repo)
        bs.goOnline({})
        expect(bs.isOnline()).to.be.eql(true)
        bs.goOffline()
        expect(bs.isOnline()).to.be.eql(false)
      })
    })

    describe('online', () => {
      beforeEach(() => {
        bs = new BlockService(repo)
      })

      it('isOnline returns true when online', () => {
        bs.goOnline({})
        expect(bs.isOnline()).to.be.eql(true)
      })

      it('retrieves a block through bitswap', (done) => {
        // returns a block with a value equal to its key
        const bitswap = {
          get (cid, callback) {
            callback(null, new Block(new Buffer('secret'), cid))
          }
        }

        bs.goOnline(bitswap)

        const data = new Buffer('secret')

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
        bs.goOnline(bitswap)

        const data = new Buffer('secret sauce')

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
