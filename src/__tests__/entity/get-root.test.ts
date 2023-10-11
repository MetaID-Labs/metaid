import { errors } from '@/data/errors.ts'
import { connect } from '@/factories/connect.ts'
import { LocalWallet } from '@/wallets/local.ts'

describe('entity.getRoot', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = await LocalWallet.create(mnemonic)

    ctx.Buzz = await connect(wallet).use('buzz')
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
