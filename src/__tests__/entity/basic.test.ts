import { use } from '@/factories/use.js'
import { LocalWallet, connect } from '@/index.js'

async function connectToLocalWallet() {
  const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
  const wallet = LocalWallet.create(mnemonic)

  return connect(wallet)
}

beforeEach(async (ctx) => {
  ctx.Buzz = await use('buzz')
})

describe('entity', () => {
  test('use entity', ({ Buzz }) => {
    expect(Buzz.name).toBe('buzz')
  })

  test.todo('has type')

  test('has address', async () => {
    const connector = await connectToLocalWallet()

    const Buzz = await connector.use('buzz')

    expect(Buzz.address).toBeTypeOf('string')
  })

  test('has metaid', async () => {
    const connector = await connectToLocalWallet()

    const Buzz = await connector.use('buzz')

    expect(Buzz.metaid).toBeTypeOf('string')
  })
})
