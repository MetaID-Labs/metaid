import { errors } from '@/data/errors.js'
import { connect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/local.js'

describe('entity.create', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = await LocalWallet.create(mnemonic)

    ctx.Buzz = await connect(wallet).use('buzz')
  })

  test('cannot create a new buzz if it is not logined', ({ Buzz }) => {
    Buzz.disconnect()
    expect(() =>
      Buzz.create({
        content: 'Hello World',
      }),
    ).toThrow(errors.NOT_CONNECTED)
  })

  test.skip('can create a new buzz', async ({ Buzz }) => {
    expect(
      await Buzz.create({
        content: 'Hello World from metaidjs',
      }),
    ).toBeTypeOf('boolean')
  })

  test.todo('cannot create a new buzz if the root is not found')
})
