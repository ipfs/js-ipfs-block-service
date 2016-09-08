/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
const pull = require('pull-stream')
const _ = require('lodash')
const series = require('run-series')

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

        series([
          (cb) => bs.put(b, cb),
          (cb) => bs.get(b.key, (err, block) => {
            if (err) return cb(err)
            expect(b).to.be.eql(block)
            cb()
          })
        ], done)
      })

      it('store and get a block, with custom extension', (done) => {
        const b = new Block('A random data block 2', 'ext')

        series([
          (cb) => bs.put(b, cb),
          (cb) => bs.get(b.key, 'ext', (err, block) => {
            if (err) return cb(err)
            expect(b).to.be.eql(block)
            cb()
          })
        ], done)
      })

      it('get a non existent block', (done) => {
        const b = new Block('Not stored')
        bs.get(b.key, (err, block) => {
          expect(err).to.exist
          done()
        })
      })

      it('store many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        pull(
          pull.values([b1, b2, b3]),
          bs.putStream(),
          pull.collect((err, meta) => {
            expect(err).to.not.exist
            expect(meta).to.have.length(3)
            done()
          })
        )
      })

      it('get: bad invocation', (done) => {
        bs.get(null, (err) => {
          expect(err).to.be.an('error')
          done()
        })
      })

      it('get many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        pull(
          pull.values([b1, b2, b3]),
          bs.putStream(),
          pull.onEnd((err) => {
            expect(err).to.not.exist
            getAndAssert()
          })
        )

        function getAndAssert () {
          pull(
            pull.values([b1.key, b2.key, b3.key]),
            pull.map((key) => bs.getStream(key)),
            pull.flatten(),
            pull.collect((err, blocks) => {
              expect(err).to.not.exist

              expect(blocks).to.be.eql([b1, b2, b3])
              done()
            })
          )
        }
      })

      it('delete a block', (done) => {
        const b = new Block('Will not live that much')
        bs.put(b, (err) => {
          expect(err).to.not.exist
          bs.delete(b.key, (err) => {
            expect(err).to.not.exist
            bs.get(b.key, (err, block) => {
              expect(err).to.exist
              done()
            })
          })
        })
      })

      it('delete: bad invocation', (done) => {
        bs.delete(null, (err) => {
          expect(err).to.be.an('error')
          done()
        })
      })

      it('delete a block, with custom extension', (done) => {
        const b = new Block('Will not live that much', 'ext')
        bs.put(b, (err) => {
          expect(err).to.not.exist
          bs.delete(b.key, 'ext', (err) => {
            expect(err).to.not.exist
            bs.get(b.key, 'ext', (err, block) => {
              expect(err).to.exist
              done()
            })
          })
        })
      })

      it('delete a non existent block', (done) => {
        const b = new Block('I do not exist')
        bs.delete(b.key, (err) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('delete many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        bs.delete([b1, b2, b3], 'data', (err) => {
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
          bs.putStream(),
          pull.onEnd((err) => {
            expect(err).to.not.exist

            pull(
              pull.values(blocks),
              pull.map((b) => b.key),
              pull.map((key) => bs.getStream(key)),
              pull.flatten(),
              pull.collect((err, res) => {
                expect(err).to.not.exist
                expect(res).to.be.eql(blocks)
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
