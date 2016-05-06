# API

```js
const BlockService = require('ipfs-block-service')
```

### `new BlockService(repo)`

Creates a new block service backed by [IPFS Repo][repo] `repo` for storage.

### `goOnline(bitswap)`

Add a bitswap instance that communicates with the network to retreive blocks
that are not in the local store.

If the node is online all requests for blocks first check locally and
afterwards ask the network for the blocks.

### `goOffline()`

Remove the bitswap instance and fall back to offline mode.

### `isOnline()`

Returns a `Boolean` indicating if the block service is online or not.

### `addBlock(block, callback(err))`

Asynchronously adds a block instance to the underlying repo.

### `addBlocks(blocks, callback(err))`

Asynchronously adds an array of block instances to the underlying repo.

*Does not guarantee atomicity.*

### `getBlock(multihash, callback(err, block))`

Asynchronously returns the block whose content multihash matches `multihash`.
Returns an error (`err.code === 'ENOENT'`) if the block does not exist.

If the block could not be found, expect `err.code` to be `'ENOENT'`.

### `getBlocks(multihashes, callback(err, blocks))`

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

### `deleteBlock(multihash, callback(err))`

Asynchronously deletes the block from the store with content multihash matching
`multihash`, if it exists.

### `bs.deleteBlocks(multihashes, callback(err))`

Asynchronously deletes all blocks from the store with content multihashes matching
from the array `multihashes`.

*Does not guarantee atomicity.*

[multihash]: https://github.com/jbenet/js-multihash
[repo]: https://github.com/ipfs/specs/tree/master/repo
