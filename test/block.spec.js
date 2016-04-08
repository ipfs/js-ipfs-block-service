/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const Block = require('../src').Block

describe('block', () => {
  it('create', () => {
    const b = new Block('random-data')
    expect(b.key).to.exist
    expect(b.data).to.exist
    expect(b.extension).to.be.eql('data')
  })

  it('fail to create an empty block', () => {
    expect(() => new Block).to.throw()
  })

  it('2 different blocks have different hashes', () => {
    const b1 = new Block('random-data')
    const b2 = new Block('more-random-data')
    expect(b1).to.not.deep.equal(b2)
  })

  it.skip('block stays immutable', () => {
    // it from the original implementation
    // It doesn't stricly verify the immutability of the Block object
    const block = new Block("Can't change this!")
    let key = block.key
    key = new Buffer('new key')

    expect(key.equals(block.key)).to.equal(false)
  })
})
