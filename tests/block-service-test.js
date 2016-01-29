/* globals describe, it */

'use strict'

const expect = require('chai').expect
const Block = require('../src').Block
const BlockService = require('../src').BlockService

const IPFSRepo = require('ipfs-repo')

describe('block-service', function () {
  var bs

  it('create a block-service', function (done) {
    var repo = new IPFSRepo(process.env.IPFS_PATH)
    bs = new BlockService(repo)
    expect(bs).to.exist
    done()
  })

  it('store a block', function (done) {
    var b = new Block('A random data block')
    bs.addBlock(b, function (err) {
      expect(err).to.not.exist
      bs.getBlock(b.key, function (err, block) {
        expect(err).to.not.exist
        expect(b.data.equals(block.data)).to.equal(true)
        expect(b.key.equals(block.key)).to.equal(true)
        done()
      })
    })
  })

  it('get a non existent block', function (done) {
    var b = new Block('Not stored')
    bs.getBlock(b.key, function (err, block) {
      expect(err).to.exist
      done()
    })
  })

  it('store many blocks', function (done) {
    var b1 = new Block('1')
    var b2 = new Block('2')
    var b3 = new Block('3')

    var blocks = []
    blocks.push(b1)
    blocks.push(b2)
    blocks.push(b3)

    bs.addBlocks(blocks, function (err) {
      expect(err).to.not.exist
      done()
    })
  })

  it('delete a block', function (done) {
    var b = new Block('Will not live that much')
    bs.addBlock(b, function (err) {
      expect(err).to.not.exist
      bs.deleteBlock(b.key, function (err) {
        expect(err).to.not.exist
        bs.getBlock(b.key, function (err, block) {
          expect(err).to.exist
          done()
        })
      })
    })
  })

  it('block-service: \t delete a non existent block', function (done) {
    var b = new Block('I do not exist')
    bs.deleteBlock(b.key, function (err) {
      expect(err).to.not.exist
      done()
    })
  })

  it('block-service: \t delete many blocks', function (done) {
    var b1 = new Block('1')
    var b2 = new Block('2')
    var b3 = new Block('3')

    var blocks = []
    blocks.push(b1.key)
    blocks.push(b2.key)
    blocks.push(b3.key)

    bs.deleteBlocks(blocks, function (err) {
      expect(err).to.not.exist
      done()
    })
  })
})
