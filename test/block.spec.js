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

  it('create /wo new', () => {
    const b = Block('random-data')
    expect(b.key).to.exist
    expect(b.data).to.exist
    expect(b.extension).to.be.eql('data')
  })

  it('fail to create an empty block', () => {
    expect(() => new Block()).to.throw()
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

  it('has the right extension to type mapping', () => {
    const b1 = new Block('hello', 'protobuf')
    const b2 = new Block('hello')
    const b3 = new Block('hello', 'ipld')
    const b4 = new Block('hello', 'woot')

    expect(b1.type).to.be.eql('protobuf')
    expect(b1.extension).to.be.eql('data')

    expect(b2.type).to.be.eql('protobuf')
    expect(b2.extension).to.be.eql('data')

    expect(b3.type).to.be.eql('ipld')
    expect(b3.extension).to.be.eql('ipld')

    expect(b4.type).to.be.eql('woot')
    expect(b4.extension).to.be.eql('woot')
  })
})
