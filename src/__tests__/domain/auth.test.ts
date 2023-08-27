import use from '@/factories/use.ts'

describe('domain.auth', () => {
  beforeEach(async (ctx) => {
    ctx.Buzz = await use('buzz')
  })

  test('has test metaid and address in env', async () => {
    expect(import.meta.env.VITE_TEST_METAID).toBeDefined()
    expect(import.meta.env.VITE_TEST_ADDRESS).toBeDefined()
  })

  test('can logout', ({ Buzz }) => {
    expect(Buzz.logout()).toBe(true)

    expect(Buzz.credential).toBeUndefined()
    expect(Buzz.credentialType).toBeUndefined()
  })

  test('can login with metaid', ({ Buzz }) => {
    expect(
      Buzz.login({
        metaid: import.meta.env.VITE_TEST_METAID,
      }),
    ).toBe(true)
    expect(Buzz.credential).toBeDefined()
    expect(Buzz.credential.metaid).toBeDefined()
    expect(Buzz.credential.address).toBeUndefined()
    expect(Buzz.credentialType).toBe('metaid')
  })

  test('can login with address', ({ Buzz }) => {
    expect(
      Buzz.login({
        address: import.meta.env.VITE_TEST_ADDRESS,
      }),
    ).toBe(true)
    expect(Buzz.credential).toBeDefined()
    expect(Buzz.credential.address).toBeDefined()
    expect(Buzz.credential.metaid).toBeUndefined()
    expect(Buzz.credentialType).toBe('address')
  })

  test.todo('can login while initializing', async ({ Buzz }) => {
    const LoginedBuzz = await use('buzz', {
      credential: {
        metaid: import.meta.env.VITE_TEST_METAID,
      },
    })

    expect(LoginedBuzz.credential).toBeDefined()
    expect(LoginedBuzz.credential.metaid).toBeDefined()
    expect(LoginedBuzz.credentialType).toBe('metaid')
  })
})
