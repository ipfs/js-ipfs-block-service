/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('../src').Block
const BlockService = require('../src').BlockService

module.exports = (repo) => {
  describe('block-service', () => {
    let bs

    it('create a block-service', (done) => {
      bs = new BlockService(repo)
      expect(bs).to.exist
      done()
    })

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
      const b = new Block('A random data block', 'ext')
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
        expect(err).to.not.exist
        expect(block).to.not.exist
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
          expect(blocks).to.have.lengthOf(3)
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
          expect(blocks).to.have.lengthOf(2)
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
            expect(err).to.not.exist
            expect(block).to.not.exist
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
            expect(err).to.not.exist
            expect(block).to.not.exist
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
  })
}
