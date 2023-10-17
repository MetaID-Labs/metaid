import { errors } from '@/data/errors.js'
import { connect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/local.js'

describe('entity.getRoot', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = LocalWallet.create(mnemonic)

    ctx.Buzz = await (await connect(wallet)).use('buzz')
  })

  test('can get root of the entity', async ({ Buzz }) => {
    const root = await Buzz.getRoot()

    expect(root).toBeTypeOf('object')
  })

  test('can not get entity root if it is not logined', ({ Buzz }) => {
    Buzz.disconnect()
    expect(() => Buzz.getRoot()).toThrow(errors.NOT_CONNECTED)
  })
})
