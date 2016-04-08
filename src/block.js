'use strict'
const util = require('./util')

// Immutable block of data
function Block (data, extension) {
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
  this.extension = extension || 'data'
}

module.exports = Block
