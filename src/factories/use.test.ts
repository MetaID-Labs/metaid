import { test } from 'vitest'
import use from './use.ts'

test('run', async () => {
  await use('buzz')
})
