IPFS Blocks JavaScript Implementation
=====================================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs-blocks.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-blocks)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-blocks.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-blocks)
![](https://img.shields.io/badge/coverage-77-yellow.svg?style=flat-square)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-blocks.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-blocks)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

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

# Installation

## npm

```sh
> npm i ipfs-blocks
```

## Use in Node.js

```js
const ipfsBlocks = require('ipfs-blocks')
```

## Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
var ipfsBlocks = require('ipfs-blocks')
```

## Use in a browser Using a script tag

Loading this module through a script tag will make the `Unixfs` obj available in the global namespace.

```html
<script src="https://npmcdn.com/ipfs-blocks/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/ipfs-blocks/dist/index.js"></script>
```

# Usage


```js
// then, to access each of the components
ipfsBlocks.BlockService
ipfsBlocks.Block
```

#### Block

Create a new block

```js
const block = new blocks.Block('some data')
console.log(block.data)
// It will print 'some data'

console.log(block.key)
// It will print the sha256 multihash of 'some data'
```

A block can also have it's own extension, which by default is `data`.

```js
const block = new blocks.Block('data', 'ipld')
console.log(block.extension)
// => ipld
```

#### BlockService

Create a new block service

```js
const bs = new ipfsBlocks.BlockService(<IPFS REPO instance> [, <IPFS Exchange>])
```

##### `addBlock`

```js
bs.addBlock(block, function (err) {
  if (!err) {
    // block successfuly added
  }
})
```

##### `addBlocks`

```js
bs.addBlocks(blockArray, function (err) {
  if (!err) {
    // blocks successfuly added
  }
})
```

##### `getBlock`

```js
bs.getBlock(multihash, function (err, block) {
  if (!err) {
    // block successfuly retrieved
  }
})
```


##### `getBlocks`

```js
bs.getBlocks(multihashArray, function (err, block) {
  if (!err) {
    // block successfuly retrieved
  }
})
```

##### `deleteBlock`

```js
bs.deleteBlock(multihash, function (err) {
  if (!err) {
    // block successfuly deleted
  }
})
```

##### `deleteBlocks`

```js
bs.deleteBlocks(multihashArray, function (err) {
  if (!err) {
    // blocks successfuly deleted
  }
})
```
