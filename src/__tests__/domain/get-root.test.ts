import errors from '@/data/errors.ts'
import use from '@/factories/use.ts'

describe('domain.getRoot', () => {
  beforeEach(async (ctx) => {
    ctx.Buzz = await use('buzz')
  })

  test('can get root of the domain', async ({ Buzz }) => {
    Buzz.login({
      metaid: import.meta.env.VITE_TEST_METAID,
    })

    const root = await Buzz.getRoot()
    console.log({ root })

    expect(root).toBeTypeOf('object')
  })

  test('can not get domain root if it is not logined', ({ Buzz }) => {
    Buzz.logout()
    expect(() => Buzz.getRoot()).toThrow(errors.NOT_LOGINED)
  })
})
