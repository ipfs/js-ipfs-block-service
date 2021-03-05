/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')

const all = require('it-all')
const { AbortController } = require('abort-controller')

const BlockService = require('../src')

/**
 * @typedef {import('ipfs-repo')} IPFSRepo
 */

describe('aborting requests', () => {
  /** @type {Error} */
  let abortedErr
  /** @type {BlockService} */
  let r

  beforeEach(() => {
    abortedErr = new Error('Aborted!')
    /**
     * @param {...any} args
     */
    const abortOnSignal = (...args) => {
      const { signal } = args[args.length - 1]

      return new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject(abortedErr)
        })
      })
    }

    /** @type {IPFSRepo} */
    const repo = {
      blocks: {
        put: abortOnSignal,
        // @ts-ignore should return async iterable
        putMany: abortOnSignal,
        get: abortOnSignal,
        delete: abortOnSignal,
        // @ts-ignore should return async iterable
        deleteMany: abortOnSignal,
        has: () => Promise.resolve(true)
      }
    }
    r = new BlockService(repo)
  })

  it('put - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    // @ts-expect-error does not take string
    await expect(r.put('block', {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })

  it('putMany - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    // @ts-expect-error does not take string array
    await expect(r.putMany(['block'], {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })

  it('get - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    // @ts-expect-error does not take string
    await expect(r.get('cid', {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })

  it('getMany - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    // @ts-expect-error does not take string array
    await expect(all(r.getMany(['cid'], {
      signal: controller.signal
    }))).to.eventually.rejectedWith(abortedErr)
  })

  it('remove - supports abort signals', async () => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 1)

    // @ts-expect-error does not take string
    await expect(r.delete('cid', {
      signal: controller.signal
    })).to.eventually.rejectedWith(abortedErr)
  })
})
