import { errors } from '@/data/errors.js'
import { connect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/local.js'

describe('entity.create', () => {
  beforeEach(async (ctx) => {
    const mnemonic = import.meta.env.VITE_TEST_MNEMONIC
    const wallet = LocalWallet.create(mnemonic)

    ctx.Buzz = await (await connect(wallet)).use('buzz')
  })

  test("cannot create a new buzz if it is not connected", async ({ Buzz }) => {
    // const txid = await Buzz.create({
    //   content: "🎂",
    //   contentType: "text/plain",
    //   quoteTx: "",
    //   attachments: [],
    //   mention: [],
    // });
    // expect(txid).toBeTypeOf("boolean");
    /**
     *
     *
     */
  });

  test.skip('can create a new buzz', async ({ Buzz }) => {
    // expect(
    //   await Buzz.create({
    //     content: '2 step create',
    //   }),
    // ).toBeTypeOf('object')
  })

  test.todo('cannot create a new buzz if the root is not found')
})
