import use from '@/factories/use.ts'

let Buzz: any

beforeAll(async () => {
  Buzz = await use('buzz')
})

describe('domain', () => {
  test('use domain', () => {
    expect(Buzz.name).toBe('buzz')
  })

  test.skip('can not check whether the domain has root if it is not logined currently', async () => {
    Buzz.logout()
    expect(Buzz.hasRoot()).toBe(false)
  })
})

describe('auth', () => {
  test('can logout', async () => {
    expect(Buzz.logout()).toBe(true)
  })

  test('can login', async () => {
    console.log(import.meta.env.VITE_TEST_METAID)
    expect(Buzz.login()).toBe(true)
  })
})

describe.todo('fluent api')
