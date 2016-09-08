/* eslint-env mocha */
'use strict'

const ncp = require('ncp').ncp
const rimraf = require('rimraf')
const path = require('path')
const IPFSRepo = require('ipfs-repo')
const Store = require('fs-pull-blob-store')

const tests = require('./block-service-test')

describe('IPFS Block Tests on Node.js', () => {
  const testRepoPath = path.join(__dirname, 'test-repo')
  const date = Date.now().toString()
  const repoPath = testRepoPath + '-for-' + date

  before((done) => {
    ncp(testRepoPath, repoPath, done)
  })

  after((done) => {
    rimraf(repoPath, done)
  })

  const repo = new IPFSRepo(repoPath, {stores: Store})
  tests(repo)
})
