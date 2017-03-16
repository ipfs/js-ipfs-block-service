/* eslint-env mocha */
'use strict'

const series = require('async/series')
const IPFSRepo = require('ipfs-repo')

const tests = require('./block-service-test')

const idb = window.indexedDB ||
        window.mozIndexedDB ||
        window.webkitIndexedDB ||
        window.msIndexedDB

idb.deleteDatabase('ipfs')
idb.deleteDatabase('ipfs/blocks')

describe('IPFS Repo Tests on the Browser', () => {
  const repo = new IPFSRepo('ipfs')

  before((done) => {
    series([
      (cb) => repo.init({}, cb),
      (cb) => repo.open(cb)
    ], done)
  })

  after((done) => {
    series([
      (cb) => repo.close(cb),
      (cb) => {
        idb.deleteDatabase('ipfs')
        idb.deleteDatabase('ipfs/blocks')

        cb()
      }
    ], done)
  })

  tests(repo)
})
