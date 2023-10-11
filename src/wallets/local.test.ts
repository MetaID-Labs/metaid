import { LocalWallet } from './local.js'

describe('wallets.local', () => {
  test('has test mnemonic in env', async () => {
    expect(import.meta.env.VITE_TEST_MNEMONIC).toBeDefined()
  })

  test('has test derive path in env', async () => {
    expect(import.meta.env.VITE_TEST_DERIVE_PATH).toBeDefined()
  })

  test('can create a new wallet', async () => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC

    // mne => rootAddress => metaid
    const wallet = await LocalWallet.create(mnemonic)

    expect(wallet).toBeInstanceOf(LocalWallet)
  })

  test('can get address', async () => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC

    const wallet = await LocalWallet.create(mnemonic)

    expect(wallet.address).toBeTypeOf('string')
  })

  test('can get metaid', async () => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC

    const wallet = await LocalWallet.create(mnemonic)

    expect(wallet.metaid).toBeTypeOf('string')
  })
})
