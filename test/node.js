/* eslint-env mocha */
'use strict'

const ncp = require('ncp').ncp
const series = require('async/series')
const rimraf = require('rimraf')
const path = require('path')
const IPFSRepo = require('ipfs-repo')

const tests = require('./block-service-test')

describe('IPFS Block Tests on Node.js', () => {
  const testRepoPath = path.join(__dirname, 'test-repo')
  const date = Date.now().toString()
  const repoPath = testRepoPath + '-for-' + date
  const repo = new IPFSRepo(repoPath)

  before((done) => {
    series([
      (cb) => ncp(testRepoPath, repoPath, cb),
      (cb) => repo.open(cb)
    ], done)
  })

  after((done) => {
    series([
      (cb) => repo.close(cb),
      (cb) => rimraf(repoPath, cb)
    ], done)
  })

  tests(repo)
})
