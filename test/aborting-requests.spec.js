/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
chai.use(require('chai-as-promised'))
const expect = chai.expect

const { collect } = require('streaming-iterables')
const AbortController = require('abort-controller')

const BlockService = require('../src')

describe('aborting requests', () => {
  let abortedErr
  let r

  beforeEach(() => {
    abortedErr = new Error('Aborted!')
    const abortOnSignal = (...args) => {
      const { signal } = args[args.length - 1]

      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(abortedErr)
        })
      })
    }

    const repo = {
      blocks: {
        put: abortOnSignal,
        putMany: abortOnSignal,
        get: abortOnSignal,
        delete: abortOnSignal,
        deleteMany: abortOnSignal,
        has: () => true
      }
    }
    r = new BlockService(repo)
  })

  it('put - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    await expect(r.put('block', {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })

  it('putMany - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    await expect(r.putMany(['block'], {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })

  it('get - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    await expect(r.get('cid', {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })

  it('getMany - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    await expect(collect(r.getMany(['cid'], {
      signal: controller.signal
    }))).to.eventually.rejectedWith(abortedErr)
  })

  it('remove - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    await expect(r.delete('cid', {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })
})
