import { use } from '@/factories/use.ts'

beforeEach(async (ctx) => {
  ctx.Buzz = await use('buzz')
})

describe('entity', () => {
  test('use entity', ({ Buzz }) => {
    expect(Buzz.name).toBe('buzz')
  })
})
