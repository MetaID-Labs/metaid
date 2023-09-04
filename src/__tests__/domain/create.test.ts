import errors from '@/data/errors.ts'
import use from '@/factories/use.ts'

describe('domain.create', () => {
  beforeEach(async (ctx) => {
    ctx.Buzz = await use('buzz', {
      credential: {
        metaid: import.meta.env.VITE_TEST_METAID,
      },
    })

    ctx.GM = await use('group-message', {
      credential: {
        metaid: import.meta.env.VITE_TEST_METAID,
      },
    })
  })

  test('cannot create a new buzz if it is not logined', ({ Buzz }) => {
    Buzz.logout()
    expect(() =>
      Buzz.create({
        content: 'Hello World',
      }),
    ).toThrow(errors.NOT_LOGINED)
  })

  test('can create a new buzz', async ({ GM }) => {
    expect(
      await GM.create({
        groupID: '',
        content: 'Hello World',
        channelId: '',
      }),
    ).toBeTypeOf('boolean')
  })

  test.todo('cannot create a new buzz if the root is not found')
})
