/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('ipfs-block')
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
        bs.addBlock(b, (err) => {
          expect(err).to.not.exist
          bs.getBlock(b.key, (err, block) => {
            expect(err).to.not.exist
            expect(b.data.equals(block.data)).to.equal(true)
            expect(b.key.equals(block.key)).to.equal(true)
            done()
          })
        })
      })

      it('store and get a block, with custom extension', (done) => {
        const b = new Block('A random data block 2', 'ext')
        bs.addBlock(b, (err) => {
          expect(err).to.not.exist
          bs.getBlock(b.key, 'ext', (err, block) => {
            expect(err).to.not.exist
            expect(b.data.equals(block.data)).to.equal(true)
            expect(b.key.equals(block.key)).to.equal(true)
            done()
          })
        })
      })

      it('get a non existent block', (done) => {
        const b = new Block('Not stored')
        bs.getBlock(b.key, (err, block) => {
          expect(err).to.exist
          done()
        })
      })

      it('store many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        bs.addBlocks([b1, b2, b3], (err) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('addBlocks: bad invocation', (done) => {
        const b1 = new Block('1')

        bs.addBlocks(b1, (err) => {
          expect(err).to.be.an('error')
          done()
        })
      })

      it('getBlock: bad invocation', (done) => {
        bs.getBlock(null, (err) => {
          expect(err).to.be.an('error')
          done()
        })
      })

      it('getBlocks: bad invocation', (done) => {
        bs.getBlocks(null, 'protobuf', (err) => {
          expect(err).to.be.an('error')
          done()
        })
      })

      it('get many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        bs.addBlocks([b1, b2, b3], (err) => {
          expect(err).to.not.exist

          bs.getBlocks([b1.key, b2.key, b3.key], (err, blocks) => {
            expect(err).to.not.exist
            expect(Object.keys(blocks)).to.have.lengthOf(3)
            expect(blocks[b1.key]).to.exist
            expect(blocks[b1.key].err).to.not.exist
            expect(blocks[b1.key].block.data).to.deep.equal(b1.data)
            expect(blocks[b2.key]).to.exist
            expect(blocks[b2.key].err).to.not.exist
            expect(blocks[b2.key].block.data).to.deep.equal(b2.data)
            expect(blocks[b3.key]).to.exist
            expect(blocks[b3.key].err).to.not.exist
            expect(blocks[b3.key].block.data).to.deep.equal(b3.data)
            done()
          })
        })
      })

      it('get many blocks: partial success', (done) => {
        const b1 = new Block('a1')
        const b2 = new Block('a2')
        const b3 = new Block('a3')

        bs.addBlocks([b1, b3], (err) => {
          expect(err).to.not.exist

          bs.getBlocks([b1.key, b2.key, b3.key], (err, blocks) => {
            expect(err).to.not.exist
            expect(Object.keys(blocks)).to.have.lengthOf(3)
            expect(blocks[b1.key]).to.exist
            expect(blocks[b1.key].err).to.not.exist
            expect(blocks[b1.key].block.data).to.deep.equal(b1.data)
            expect(blocks[b2.key]).to.exist
            expect(blocks[b2.key].err).to.exist
            expect(blocks[b2.key].block).to.not.exist
            expect(blocks[b3.key]).to.exist
            expect(blocks[b3.key].err).to.not.exist
            expect(blocks[b3.key].block.data).to.deep.equal(b3.data)
            done()
          })
        })
      })

      it('delete a block', (done) => {
        const b = new Block('Will not live that much')
        bs.addBlock(b, (err) => {
          expect(err).to.not.exist
          bs.deleteBlock(b.key, (err) => {
            expect(err).to.not.exist
            bs.getBlock(b.key, (err, block) => {
              expect(err).to.exist
              done()
            })
          })
        })
      })

      it('deleteBlock: bad invocation', (done) => {
        bs.deleteBlock(null, (err) => {
          expect(err).to.be.an('error')
          done()
        })
      })

      it('delete a block, with custom extension', (done) => {
        const b = new Block('Will not live that much', 'ext')
        bs.addBlock(b, (err) => {
          expect(err).to.not.exist
          bs.deleteBlock(b.key, 'ext', (err) => {
            expect(err).to.not.exist
            bs.getBlock(b.key, 'ext', (err, block) => {
              expect(err).to.exist
              done()
            })
          })
        })
      })

      it('delete a non existent block', (done) => {
        const b = new Block('I do not exist')
        bs.deleteBlock(b.key, (err) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('delete many blocks', (done) => {
        const b1 = new Block('1')
        const b2 = new Block('2')
        const b3 = new Block('3')

        bs.deleteBlocks([b1, b2, b3], 'data', (err) => {
          expect(err).to.not.exist
          done()
        })
      })

      it('deleteBlocks: bad invocation', (done) => {
        bs.deleteBlocks(null, (err) => {
          expect(err).to.be.an('error')
          done()
        })
      })

      it('stores and gets lots of blocks', function (done) {
        this.timeout(60 * 1000)

        const blocks = []
        const count = 1000
        while (blocks.length < count) {
          blocks.push(new Block('hello-' + Math.random()))
        }

        bs.addBlocks(blocks, (err) => {
          expect(err).to.not.exist

          bs.getBlocks(blocks.map((b) => b.key), (err, res) => {
            expect(err).to.not.exist
            expect(Object.keys(res)).to.have.length(count)

            done()
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
        const bitswap = {
          getBlock (key, cb) {
            cb(null, new Block(key))
          }
        }
        bs.goOnline(bitswap)

        bs.getBlock('secret', (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql(new Block('secret'))
          done()
        })
      })

      it('puts the block through bitswap', (done) => {
        const bitswap = {
          hasBlock (block, cb) {
            cb()
          }
        }
        bs.goOnline(bitswap)
        bs.addBlock(new Block('secret sauce'), done)
      })
    })
  })
}
