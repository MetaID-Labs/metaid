import { use } from '@/factories/use.js'

beforeEach(async (ctx) => {
  ctx.Buzz = await use('buzz')
})

describe('entity', () => {
  test('use entity', ({ Buzz }) => {
    expect(Buzz.name).toBe('buzz')
  })

  test.todo('has type')
})
