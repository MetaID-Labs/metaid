import { use } from './use.js'

test('run', async () => {
  const Buzz = await use('buzz')
  expect(Buzz.name).toBe('buzz')
})

test('can use entity with multi-word name', async () => {
  const Metaid = await use('metaid-root')
  expect(Metaid.name).toBe('metaid')
})

test.todo('can load entity schema from nested folders')
