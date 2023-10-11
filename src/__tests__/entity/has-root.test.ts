import { errors } from '@/data/errors.ts'
import { connect } from '@/factories/connect.ts'
import { LocalWallet } from '@/wallets/local.ts'

describe('entity.hasRoot', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = await LocalWallet.create(mnemonic)

    ctx.Buzz = await connect(wallet).use('buzz')
  })

  test('can check whether the entity has root if it is connected', ({ Buzz }) => {
    expect(Buzz.hasRoot()).toBeTypeOf('boolean')
  })

  test('can not check whether the entity has root if it is not connected', ({ Buzz }) => {
    Buzz.disconnect()
    expect(() => Buzz.hasRoot()).toThrow(errors.NOT_CONNECTED)
  })
})
