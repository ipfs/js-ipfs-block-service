/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const pull = require('pull-stream')
const _ = require('lodash')
const map = require('async/map')
const waterfall = require('async/waterfall')
const CID = require('cids')

const BlockService = require('../src')

module.exports = (repo) => {
  describe('block-service', () => {
    let bs

    before(() => {
      bs = new BlockService(repo)
    })

    describe('offline', () => {
      it('store and get a block', (done) => {
        const b = new Block('A random data block')
        b.key((err, key) => {
          expect(err).to.not.exist
          const cid = new CID(key)

          waterfall([
            (cb) => bs.put({ block: b, cid: cid }, cb),
            (cb) => bs.get(cid, (err, block) => {
              if (err) {
                return cb(err)
              }
              block.key(cb)
            }),
            (blockKey, cb) => {
              expect(key).to.be.eql(blockKey)
              cb()
            }
          ], done)
        })
      })

      it('get a non existent block', (done) => {
        const b = new Block('Not stored')

        b.key((err, key) => {
          expect(err).to.not.exist
          const cid = new CID(key)

          bs.get(cid, (err, block) => {
            expect(err).to.exist
            done()
          })
        })
      })

      it('store many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        pull(
          pull.values([b1, b2, b3]),
          pull.asyncMap((b, cb) => {
            b.key((err, key) => {
              if (err) {
                return cb(err)
              }
              cb(null, {
                block: b,
                cid: new CID(key)
              })
            })
          }),
          bs.putStream(),
          pull.collect((err, meta) => {
            expect(err).to.not.exist
            expect(meta).to.have.length(3)
            done()
          })
        )
      })

      it('get many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        pull(
          pull.values([b1, b2, b3]),
          pull.asyncMap((b, cb) => {
            b.key((err, key) => {
              if (err) {
                return cb(err)
              }
              cb(null, {
                block: b,
                cid: new CID(key)
              })
            })
          }),
          bs.putStream(),
          pull.onEnd((err) => {
            expect(err).to.not.exist
            getAndAssert()
          })
        )

        function getAndAssert () {
          pull(
            pull.values([b1, b2, b3]),
            pull.asyncMap((b, cb) => b.key(cb)),
            pull.map((key) => {
              const cid = new CID(key)
              return bs.getStream(cid)
            }),
            pull.flatten(),
            pull.collect((err, blocks) => {
              expect(err).to.not.exist
              map(blocks.concat([b1, b2, b3]), (b, cb) => {
                b.key(cb)
              }, (err, res) => {
                expect(err).to.not.exist
                expect(res.slice(0, blocks.length)).to.be.eql(res.slice(blocks.length))
                done()
              })
            })
          )
        }
      })

      it('delete a block', (done) => {
        const b = new Block('Will not live that much')
        let cid
        waterfall([
          (cb) => b.key(cb),
          (key, cb) => {
            cid = new CID(key)
            cb()
          },
          (cb) => bs.put({ block: b, cid: cid }, cb),
          (cb) => bs.delete(cid, cb),
          (res, cb) => bs.get(cid, (err, res) => {
            expect(err).to.exist
            expect(res).to.not.exist
            cb()
          })
        ], done)
      })

      it('delete a non existent block', (done) => {
        const b = new Block('I do not exist')
        waterfall([
          (cb) => b.key(cb),
          (key, cb) => bs.delete(new CID(key), cb)
        ], done)
      })

      it('delete many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        map([b1, b2, b3], (b, cb) => {
          b.key(cb)
        }, (err, keys) => {
          expect(err).to.not.exist
          bs.delete(keys.map((k) => new CID(k)), done)
        })
      })

      it('stores and gets lots of blocks', function (done) {
        this.timeout(60 * 1000)

        const blocks = _.range(1000).map((i) => {
          return new Block(`hello-${i}-${Math.random()}`)
        })

        pull(
          pull.values(blocks),
          pull.asyncMap((block, cb) => {
            block.key((err, key) => {
              if (err) {
                return cb(err)
              }
              cb(null, {
                block: block,
                cid: new CID(key)
              })
            })
          }),
          bs.putStream(),
          pull.onEnd((err) => {
            expect(err).to.not.exist

            pull(
              pull.values(blocks),
              pull.asyncMap((block, cb) => block.key(cb)),
              pull.map((key) => {
                const cid = new CID(key)
                return bs.getStream(cid)
              }),
              pull.flatten(),
              pull.collect((err, retrievedBlocks) => {
                expect(err).to.not.exist
                expect(retrievedBlocks.length).to.be.eql(blocks.length)
                done()
              })
            )
          })
        )
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
          getStream (key) {
            return pull.values([
              new Block('secret')
            ])
          }
        }

        bs.goOnline(bitswap)

        const block = new Block('secret')

        waterfall([
          (cb) => block.key('sha2-256', cb),
          (key, cb) => bs.get(new CID(key), cb),
          (block, cb) => {
            expect(block.data).to.be.eql(new Block('secret').data)
            cb()
          }
        ], done)
      })

      it('puts the block through bitswap', (done) => {
        const bitswap = {
          putStream () {
            return pull.through(() => {})
          }
        }
        bs.goOnline(bitswap)

        const block = new Block('secret sauce')

        waterfall([
          (cb) => block.key('sha2-256', cb),
          (key, cb) => bs.put({block: block, cid: new CID(key)}, cb)
        ], done)
      })

      it('getStream through bitswap', (done) => {
        const b = new Block('secret sauce 1')

        const bitswap = {
          getStream () {
            return pull.values([b])
          }
        }

        bs.goOnline(bitswap)

        b.key((err, key) => {
          expect(err).to.not.exist
          const cid = new CID(key)

          pull(
            bs.getStream(cid),
            pull.collect((err, blocks) => {
              expect(err).to.not.exist
              expect(blocks[0].data).to.be.eql(b.data)
              blocks[0].key('sha2-256', (err, blockKey) => {
                expect(err).to.not.exist
                expect(blockKey).to.be.eql(cid.multihash)
                done()
              })
            })
          )
        })
      })
    })
  })
}
