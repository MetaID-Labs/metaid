import { MetaletWallet } from './metalet.js'

describe.skip('wallets.local', () => {
  test('can create a new wallet', async () => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC

    // mne => rootAddress => metaid
    const wallet = LocalWallet.create(mnemonic)

    expect(wallet).toBeInstanceOf(LocalWallet)
  })

  // test('can get address', async () => {
  //   const mnemonic = import.meta.env.VITE_TEST_MNEMONIC

  //   const wallet = LocalWallet.create(mnemonic)

  //   expect(wallet.address).toBeTypeOf('string')
  // })
})
