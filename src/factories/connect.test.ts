import { LocalWallet } from '@/wallets/local.js'
import { connect } from './connect.js'
import { mvc } from 'meta-contract'

async function connectToLocalWallet(mnemonic?: string) {
  if (!mnemonic) {
    mnemonic = import.meta.env.VITE_TEST_MNEMONIC
  }
  const wallet = LocalWallet.create(mnemonic)

  return connect(wallet)
}

describe('factories.connect', () => {
  test('can connect to a local wallet', async () => {
    const connector = await connectToLocalWallet()
    expect(connector).toBeTypeOf('object')

    const Buzz = await connector.use('buzz')
    expect(Buzz.name).toBe('buzz')
  })

  test('is connected', async () => {
    const connector = await connectToLocalWallet()

    expect(connector.isConnected()).toBe(true)
  })

  test('the entity created by the connector has itself', async () => {
    const connector = await connectToLocalWallet()

    const Buzz = await connector.use('buzz')

    expect(Buzz.connector).toBe(connector)
  })

  test('the global connector is the same as the connector created by the factory', async () => {
    const connector = await connectToLocalWallet()

    const Buzz = await connector.use('buzz')
    const GM = await connector.use('group-message')

    expect(connector.isConnected()).toBe(true)
    expect(Buzz.isConnected()).toBe(true)
    expect(GM.isConnected()).toBe(true)

    // disconnect
    connector.disconnect()
    expect(connector.isConnected()).toBe(false)
    expect(Buzz.isConnected()).toBe(false)
    expect(GM.isConnected()).toBe(false)
  })

  test('has address', async () => {
    const connector = await connectToLocalWallet()

    expect(connector.address).toBeTypeOf('string')
  })

  test('has metaid', async () => {
    const connector = await connectToLocalWallet()

    expect(connector.metaid).toBeTypeOf('string')
  })

  test('can get user', async () => {
    const connector = await connectToLocalWallet()

    const user = connector.getUser()

    expect(user).toBeTypeOf('object')
    expect(user.metaid).toBeTypeOf('string')
  })

  test('cannot get user if it is not created yet', async () => {
    const newMnemonic = mvc.Mnemonic.fromRandom().toString()
    const connector = await connectToLocalWallet(newMnemonic)

    expect(connector.hasUser()).toBe(false)
    expect(connector.getUser()).toBe(undefined)
  })

  test('can create user if it is not created yet', async () => {
    const newMnemonic = mvc.Mnemonic.fromRandom().toString()
    console.log({ newMnemonic })
    const connector = await connectToLocalWallet(newMnemonic)

    expect(connector.isMetaidValid()).toBe(false)

    await connector.createMetaid()

    expect(connector.hasUser()).toBe(true)
  })
})
