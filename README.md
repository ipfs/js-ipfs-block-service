IPFS Blocks JavaScript Implementation
=====================================

[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
![](https://img.shields.io/badge/coverage-75%25-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/ipfs/js-ipfs-merkle-dag.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-merkledag) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> JavaScript Implementation of the BlockService and Block data structure

## Architecture

```markdown
┌────────────────────┐
│   BlockService     │
└────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌────────┐
│IPFS REPO│ │Exchange│
└─────────┘ └────────┘
```

**BlockService** - The BlockService uses IPFS Repo as the local datastore for blocks and an IPFS Exchange compliant implementation to fetch blocks from the network.

A Block is a data structure available on this module.

## Usage

```bash
$ npm i ipfs-blocks
```

```javascript
const ipfsBlocks = require('ipfs-blocks')

// then, to access each of the components
ipfsBlocks.BlockService
ipfsBlocks.Block
```

#### Block

Create a new block

```JavaScript
var block = new blocks.Block('some data')
console.log(block.data) 
// It will print 'some data'
console.log(block.key)
// It will print the sha256 multihash of 'some data'
```

#### BlockService

Create a new block service

```JavaScript
var bs = new ipfsBlocks.BlockService(<IPFS REPO instance> [, <IPFS Exchange>])
```

##### addBlock

```JavaScript
bs.addBlock(block, function (err) {
  if (!err) {
    // block successfuly added
  }
})
```

##### addBlocks

```JavaScript
bs.addBlocks(blockArray, function (err) {
  if (!err) {
    // blocks successfuly added
  }
})
```

##### getBlock

```JavaScript
bs.getBlock(multihash, function (err, block) {
  if (!err) {
    // block successfuly retrieved
  }
})
```


##### getBlocks

```JavaScript
bs.getBlocks(multihashArray, function (err, block) {
  if (!err) {
    // block successfuly retrieved
  }
})
```

##### deleteBlock

```JavaScript
bs.deleteBlock(multihash, function (err) {
  if (!err) {
    // block successfuly deleted
  }
})
```

##### deleteBlocks

```JavaScript
bs.deleteBlocks(multihashArray, function (err) {
  if (!err) {
    // blocks successfuly deleted
  }
})
```
