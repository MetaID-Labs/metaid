import { use } from './use.js'

test('run', async () => {
  const Buzz = await use('buzz')
  expect(Buzz.name).toBe('buzz')
})

test('can load entity schema from nested folders', async () => {
  const Metaid = await use('user/metaid')
  expect(Metaid.name).toBe('metaid')
})
