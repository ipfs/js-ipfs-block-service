/* eslint-env mocha */
'use strict'

const fs = require('fs-extra')
const path = require('path')
const IPFSRepo = require('ipfs-repo')

const tests = require('./block-service-test')

describe('IPFS Block Tests on Node.js', () => {
  const testRepoPath = path.join(__dirname, 'test-repo')
  const date = Date.now().toString()
  const repoPath = testRepoPath + '-for-' + date
  const repo = new IPFSRepo(repoPath)

  before(async () => {
    await fs.copy(testRepoPath, repoPath)
    await repo.open()
  })

  after(async () => {
    await repo.close()
    await fs.remove(repoPath)
  })

  tests(repo)
})
