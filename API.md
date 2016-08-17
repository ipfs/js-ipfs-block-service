# API

```js
const BlockService = require('ipfs-block-service')
```

### `new BlockService(repo)`

- `repo: Repo`

Creates a new block service backed by [IPFS Repo][repo] `repo` for storage.

### `goOnline(bitswap)`

- `bitswap: Bitswap`

Add a bitswap instance that communicates with the network to retreive blocks
that are not in the local store.

If the node is online all requests for blocks first check locally and
afterwards ask the network for the blocks.

### `goOffline()`

Remove the bitswap instance and fall back to offline mode.

### `isOnline()`

Returns a `Boolean` indicating if the block service is online or not.

### `put(block, callback)`

- `block: Block`
- `callback: Function`

Asynchronously adds a block instance to the underlying repo.

### `putStream()`

Returns a through pull-stream, which `Block`s can be written to, and
that emits the meta data about the written block.

### `get(multihash [, extension], callback)`

- `multihash: Multihash`
- `extension: String`, defaults to 'data'
- `callback: Function`

Asynchronously returns the block whose content multihash matches `multihash`.

### `getStream(multihash [, extension])`

- `multihash: Multihash`
- `extension: String`, defaults to 'data'

Returns a source pull-stream, which emits the requested block.

### `delete(multihashes, [, extension], callback)`

- `multihashes: Multihash|[]Multihash`
- `extension: String`, defaults to 'data'- `extension: String`, defaults to 'data'
- `callback: Function`

Deletes all blocks referenced by multihashes.

[multihash]: https://github.com/multiformats/js-multihash
[repo]: https://github.com/ipfs/specs/tree/master/repo
