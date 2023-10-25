import { errors } from '@/data/errors.js'
import { connect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/local.js'

describe('entity.repost', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = LocalWallet.create(mnemonic)
    console.log('wallet132', wallet)
    ctx.Repost = await (await connect(wallet)).use('repost')
  })

  test('cannot repost buzz if it is not connected', async ({ Repost }) => {
    //Repost.disconnect()
    const { txid } = await Repost.create({
      createTime: new Date().getTime(),
      rePostTx: '',
      rePostProtocol: '',
      rePostComment: '',
    })
    expect(txid).toBeTypeOf('string')
  })

  test.skip('can create a new buzz', async ({ Repost }) => {
    expect(
      await Repost.create({
        createTime: new Date().getTime(),
        rePostTx: '',
        rePostProtocol: '',
        rePostComment: '',
      })
    ).toBeTypeOf('object')
  })

  test.todo('cannot create a new buzz if the root is not found')
})
