/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const pull = require('pull-stream')
const _ = require('lodash')
const series = require('run-series')
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
        const cid = new CID(b.key())

        series([
          (cb) => bs.put({ block: b, cid: cid }, cb),
          (cb) => bs.get(cid, (err, block) => {
            if (err) {
              return cb(err)
            }
            expect(b.key()).to.be.eql(block.key())
            cb()
          })
        ], done)
      })

      it('get a non existent block', (done) => {
        const b = new Block('Not stored')
        const cid = new CID(b.key())

        bs.get(cid, (err, block) => {
          expect(err).to.exist
          done()
        })
      })

      it('store many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        pull(
          pull.values([
            { block: b1, cid: new CID(b1.key()) },
            { block: b2, cid: new CID(b2.key()) },
            { block: b3, cid: new CID(b3.key()) }
          ]),
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
          pull.values([
            { block: b1, cid: new CID(b1.key()) },
            { block: b2, cid: new CID(b2.key()) },
            { block: b3, cid: new CID(b3.key()) }
          ]),
          bs.putStream(),
          pull.onEnd((err) => {
            expect(err).to.not.exist
            getAndAssert()
          })
        )

        function getAndAssert () {
          pull(
            pull.values([
              b1.key(),
              b2.key(),
              b3.key()
            ]),
            pull.map((key) => {
              const cid = new CID(key)
              return bs.getStream(cid)
            }),
            pull.flatten(),
            pull.collect((err, blocks) => {
              expect(err).to.not.exist
              const bPutKeys = blocks.map((b) => {
                return b.key()
              })

              expect(bPutKeys).to.be.eql([b1.key(), b2.key(), b3.key()])
              done()
            })
          )
        }
      })

      it('delete a block', (done) => {
        const b = new Block('Will not live that much')
        bs.put({ block: b, cid: new CID(b.key()) }, (err) => {
          expect(err).to.not.exist
          const cid = new CID(b.key())
          bs.delete(cid, (err) => {
            expect(err).to.not.exist
            bs.get(cid, (err, block) => {
              expect(err).to.exist
              done()
            })
          })
        })
      })

      it('delete a non existent block', (done) => {
        const b = new Block('I do not exist')
        const cid = new CID(b.key())
        bs.delete(cid, (err) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('delete many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        bs.delete([
          new CID(b1.key()),
          new CID(b2.key()),
          new CID(b3.key())
        ], (err) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('stores and gets lots of blocks', function (done) {
        this.timeout(60 * 1000)

        const blocks = _.range(1000).map((i) => {
          return new Block(`hello-${i}-${Math.random()}`)
        })

        pull(
          pull.values(blocks),
          pull.map((block) => {
            return { block: block, cid: new CID(block.key()) }
          }),
          bs.putStream(),
          pull.onEnd((err) => {
            expect(err).to.not.exist

            pull(
              pull.values(blocks),
              pull.map((block) => {
                return block.key()
              }),
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

    describe.skip('online', () => {
      beforeEach(() => {
        bs = new BlockService(repo)
      })

      it('isOnline returns true when online', () => {
        bs.goOnline({})
        expect(bs.isOnline()).to.be.eql(true)
      })

      it('retrieves a block through bitswap', (done) => {
        const bitswap = {
          getStream (key) {
            return pull.values([new Block(key)])
          }
        }
        bs.goOnline(bitswap)

        bs.get('secret', (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql(new Block('secret'))
          done()
        })
      })

      it('puts the block through bitswap', (done) => {
        const bitswap = {
          putStream () {
            return pull.through(() => {})
          }
        }
        bs.goOnline(bitswap)
        bs.put(new Block('secret sauce'), done)
      })

      it('getStream through bitswap', (done) => {
        const b = new Block('secret sauce 1')

        const bitswap = {
          getStream () {
            return pull.values([b])
          }
        }

        bs.goOnline(bitswap)
        pull(
          bs.getStream(b.key),
          pull.collect((err, res) => {
            expect(err).to.not.exist
            expect(res).to.be.eql([b])
            done()
          })
        )
      })
    })
  })
}
