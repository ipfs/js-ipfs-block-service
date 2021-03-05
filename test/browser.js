/* eslint-env mocha */
/* global self */
'use strict'

const IPFSRepo = require('ipfs-repo')

const tests = require('./block-service-test')

const idb = self.indexedDB ||
        // @ts-ignore
        self.mozIndexedDB ||
        // @ts-ignore
        self.webkitIndexedDB ||
        // @ts-ignore
        self.msIndexedDB

idb.deleteDatabase('ipfs')
idb.deleteDatabase('ipfs/blocks')

describe('IPFS Repo Tests on the Browser', () => {
  const repo = new IPFSRepo('ipfs')

  before(async () => {
    await repo.init({})
    await repo.open()
  })

  after(async () => {
    await repo.close()

    idb.deleteDatabase('ipfs')
    idb.deleteDatabase('ipfs/blocks')
  })

  tests(repo)
})
