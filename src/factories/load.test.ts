import { load } from './load.js'
import buzzSchema from '@/metaid-entities/buzz.entity.js'

test('run', async () => {
  const Buzz = await load(buzzSchema)
  expect(Buzz.name).toBe('buzz')
})
