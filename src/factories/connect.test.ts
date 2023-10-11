import { LocalWallet } from '@/wallets/local.js'
import { connect } from './connect.js'
import { use } from './use.js'

async function connectToLocalWallet() {
  const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
  const wallet = await LocalWallet.create(mnemonic)

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

  test('connector has address', async () => {
    const connector = await connectToLocalWallet()

    expect(connector.address).toBeTypeOf('string')
  })

  test('entity has address', async () => {
    const connector = await connectToLocalWallet()

    const Buzz = await connector.use('buzz')

    expect(Buzz.address).toBeTypeOf('string')
  })

  test.todo('connector has metaid', async () => {
    const connector = await connectToLocalWallet()

    expect(connector.metaid).toBeTypeOf('string')
  })

  test.todo('entity has metaid', async () => {
    const connector = await connectToLocalWallet()

    const Buzz = await connector.use('buzz')

    expect(Buzz.metaid).toBeTypeOf('string')
  })
})
