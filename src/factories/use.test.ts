import { use } from './use.js'

test('run', async () => {
  const Buzz = await use('buzz')

  expect(Buzz.name).toBe('buzz')
})
