import { errors } from '@/data/errors.js'
import { connect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/local.js'

describe('entity.getMetaidInfo', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = LocalWallet.create(mnemonic)
    ctx.Metaid = await (await connect(wallet)).use('create-metaid-root')
  })

  test('can get metaid of the entity', async ({ Metaid }) => {})

  // test("can not get entity root if it is not logined", ({ Buzz }) => {
  //   Buzz.disconnect();
  //   expect(() => Buzz.getRoot()).toThrow(errors.NOT_CONNECTED);
  // });
})
