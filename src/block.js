'use strict'
const util = require('./util')

// Immutable block of data
function Block (data, type) {
  if (!data) {
    throw new Error('Block must be constructed with data')
  }

  if (!(this instanceof Block)) {
    return new Block(data)
  }

  if (data instanceof Buffer) {
    this.data = data
  } else {
    this.data = new Buffer(data)
  }

  this.key = util.hash(this.data)
  this.type = type || 'protobuf'
}

Object.defineProperty(Block.prototype, 'extension', {
  get () {
    switch (this.type) {
      case 'protobuf':
        return 'data'
      case 'ipld':
        return 'ipld'
      default:
        return this.type
    }
  }
})

module.exports = Block
