const util = require('./util')

// Immutable block of data

module.exports = Block

function Block (data) {
  if (!data) { throw new Error('Block must be constructed with data') }

  if (!(this instanceof Block)) { return new Block(data) }

  this.data = new Buffer(data)
  this.key = util.hash(this.data)
}
