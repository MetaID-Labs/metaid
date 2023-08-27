import use from '../use.ts'

test('run', async () => {
  const Buzz = await use('buzz')

  expect(Buzz.name).toBe('buzz')
})
