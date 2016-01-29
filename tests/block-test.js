/* globals describe, it */

'use strict'

const expect = require('chai').expect
const Block = require('../src').Block

describe('block', () => {
  it('block: \t\t create a new block', (done) => {
    const b = new Block('random-data')
    expect(b.key).to.exist
    expect(b.data).to.exist
    done()
  })

  it('fail to create an empty block', (done) => {
    var b
    try {
      b = new Block()
    } catch (err) {
      expect(b).to.not.exist
      done()
    }
  })

  it('2 different blocks have different hashes', (done) => {
    const b1 = new Block('random-data')
    const b2 = new Block('more-random-data')
    expect(b1).to.not.deep.equal(b2)
    done()
  })

  it.skip('block stays immutable', (done) => {
    // it from the original implementation
    // It doesn't stricly verify the immutability of the Block object
    const block = new Block("Can't change this!")
    var key = block.key
    key = new Buffer('new key')

    expect(key.equals(block.key)).to.equal(false)
    done()
  })
})
