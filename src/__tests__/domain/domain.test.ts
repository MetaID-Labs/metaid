import use from '@/factories/use.ts'

beforeEach(async (ctx) => {
  ctx.Buzz = await use('buzz')
})

describe('domain', () => {
  test('use domain', ({ Buzz }) => {
    expect(Buzz.name).toBe('buzz')
  })
})
