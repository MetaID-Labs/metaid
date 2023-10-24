import { errors } from '@/data/errors.js'
import { connect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/local.js'

describe('entity.repost', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = LocalWallet.create(mnemonic)

    ctx.Repost = await (await connect(wallet)).use('repost')
  })

  test('cannot repost buzz if it is not connected', async ({ Repost }) => {
    //Repost.disconnect()

    expect(() =>
      Repost.create({
        createTime: new Date().getTime(),
        rePostTx: 'b5e015d6662125a83ab9fd5cce620a7240dc75023ee2867b84a1d75ddaf1a277',
        rePostProtocol: 'SimpleMicroblog',
        rePostComment: '',
      })
    ).rejects.toThrow(errors.NOT_CONNECTED)
  })

  //   test.skip('can create a new buzz', async ({ Buzz }) => {
  //     expect(
  //       await Buzz.create({
  //         content: '2 step create',
  //       })
  //     ).toBeTypeOf('object')
  //   })

  test.todo('cannot create a new buzz if the root is not found')
})
