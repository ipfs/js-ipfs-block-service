# IPFS Block Service JavaScript Implementation

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs-block-service.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs-block-service)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs-block-service.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs-block-service)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs-block-service/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs-block-service?branch=master)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> [IPFS][ipfs] implementation of the BlockService and Block data structure in
> JavaScript.

**BlockService** - A BlockService is a content-addressable store for blocks,
providing an API for adding, deleting, and retrieving blocks. A BlockService is
backed by an [IPFS Repo][repo] as its datastore for blocks, and uses [Bitswap][bitswap] to fetch blocks from the network.

```markdown
┌────────────────────┐
│     BlockService   │
└────────────────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐ ┌───────┐
│IPFS Repo│ |Bitswap│
└─────────┘ └───────┘
```

## Table of Contents

- [Install](#install)
  - [npm](#npm)
- [Usage](#usage)
  - [Node.js](#nodejs)
  - [Example](#example)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [Browser: `<script>` Tag](#browser-script-tag)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm i ipfs-block-service
```

## Usage

### Node.js

```js
const BlockService = require('ipfs-block-service')
```


### Example

```js
const BlockService = require('ipfs-block-service')
const Block = require('ipfs-block')
const IPFSRepo = require('ipfs-repo')  // storage repo
const Store = require(interface-pull-blob-store')  // in-memory store

// setup a repo
var repo = new IPFSRepo('example', { stores: Store })

// create a block
const block = new Block('hello world)
console.log(block.data)
console.log(block.key)

// create a service
const bs = new BlockService(repo)

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

### Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```JavaScript
var BlockService = require('ipfs-block-service')
```

### Browser: `<script>` Tag

Loading this module through a script tag will make the `IpfsBlockService` obj available in
the global namespace.

```html
<script src="https://unpkg.com/ipfs-block-service/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/ipfs-block-service/dist/index.js"></script>
```

You can find the [API documentation here](API.md)

[ipfs]: https://ipfs.io
[bitswap]: https://github.com/ipfs/specs/tree/master/bitswap

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/js-ipfs-block-service/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)
