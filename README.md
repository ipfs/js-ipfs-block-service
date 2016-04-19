IPFS Blocks JavaScript Implementation
=====================================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs-blocks.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-blocks)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-blocks.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-blocks)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-blocks/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-blocks?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-blocks.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-blocks)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> [IPFS][ipfs] implementation of the BlockService and Block data structure in
> JavaScript.

## Description

**Block** - A block is a blob of binary data.

**BlockService** - A BlockService is a content-addressable store for blocks,
providing an API for adding, deleting, and retrieving blocks. A BlockService is
backed by an [IPFS Repo][repo] as its datastore for blocks, and uses an [IPFS
Exchange][bitswap] implementation to fetch blocks from the network.

```markdown
┌────────────────────┐
│     BlockService   │
└────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌────────┐
│IPFS Repo│ │Exchange│
└─────────┘ └────────┘
```

## Example

```js
const blocks = require('ipfs-blocks')
const IPFSRepo = require('ipfs-repo')  // storage repo
const memstore = require('abstract-blob-store')  // in-memory store

// setup a repo
var repo = new IPFSRepo('example', { stores: memstore })

// create a block
const block = new blocks.Block('hello warld')
console.log(block.data)
console.log(block.key)

// create a service
const bs = new blocks.BlockService(repo)

// add the block, then retrieve it
bs.addBlock(block, function (err) {
  bs.getBlock(block.key, function (err, b) {
    console.log(block.data.toString() === b.data.toString())
  })
})
```

outputs

```
<Buffer 68 65 6c 6c 6f 20 77 61 72 6c 64>

<Buffer 12 20 db 3c 15 23 3f f3 84 8f 42 fe 3b 74 78 90 90 5a 80 7e a6 ef 2b 6d 2f 3c 8b 2c b7 ae be 86 3c 4d>

true

```

## Installation

### npm

```sh
> npm i ipfs-blocks
```

## Setup

### Node.js

```js
const blocks = require('ipfs-blocks')
```

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```JavaScript
var blocks = require('ipfs-blocks')
```

### Browser: `<script>` Tag

Loading this module through a script tag will make the `Unixfs` obj available in
the global namespace.

```html
<script src="https://npmcdn.com/ipfs-blocks/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/ipfs-blocks/dist/index.js"></script>
```

## API

```js
const blocks = require('ipfs-blocks')
```

### Block

#### var block = new blocks.Block(data)

Creates a new block with raw data `data`.

#### block.data

The raw data of the block. Its format matches whatever was provided in its
constructor.

#### block.key

The [multihash][multihash] of the block's data, as a buffer.

### var bs = new blocks.BlockService(repo[, exchange])

Creates a new block service backed by [IPFS Repo][repo] `repo` for storage, and
[IPFS Exchange][bitswap] for retrieving blocks from the network. Providing an
`exchange` is optional.

#### bs.addBlock(block, callback(err))

Asynchronously adds a block instance to the underlying repo.

#### bs.addBlocks(blocks, callback(err))

Asynchronously adds an array of block instances to the underlying repo.

*Does not guarantee atomicity.*

#### bs.getBlock(multihash, callback(err, block))

Asynchronously returns the block whose content multihash matches `multihash`.
Returns an error (`err.code === 'ENOENT'`) if the block does not exist.

If the block could not be found, expect `err.code` to be `'ENOENT'`.

#### bs.getBlocks(multihashes, callback(err, blocks))

Asynchronously returns the blocks whose content multihashes match the array
`multihashes`.

`blocks` is an object that maps each `multihash` to an object of the form

```js
{
  err: Error
  block: Block
}
```

Expect `blocks[multihash].err.code === 'ENOENT'`  and `blocks[multihash].block
=== null` if a block did not exist.

*Does not guarantee atomicity.*

#### bs.deleteBlock(multihash, callback(err))

Asynchronously deletes the block from the store with content multihash matching
`multihash`, if it exists.

#### bs.deleteBlocks(multihashes, callback(err))

Asynchronously deletes all blocks from the store with content multihashes matching
from the array `multihashes`.

*Does not guarantee atomicity.*

## License

MIT

[ipfs]: https://ipfs.io
[repo]: https://github.com/ipfs/specs/tree/master/repo
[bitswap]: https://github.com/ipfs/specs/tree/master/bitswap
[multihash]: https://github.com/jbenet/js-multihash
