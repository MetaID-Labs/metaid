import errors from '@/data/errors.ts'
import use from '@/factories/use.ts'

describe('domain.hasRoot', () => {
  beforeEach(async (ctx) => {
    ctx.Buzz = await use('buzz')
  })

  test('can check whether the domain has root if it is logined', ({ Buzz }) => {
    Buzz.login({
      metaid: import.meta.env.VITE_TEST_METAID,
    })

    expect(Buzz.hasRoot()).toBeTypeOf('boolean')
  })

  test('can not check whether the domain has root if it is not logined', ({ Buzz }) => {
    Buzz.logout()
    expect(() => Buzz.hasRoot()).toThrow(errors.NOT_LOGINED)
  })
})
