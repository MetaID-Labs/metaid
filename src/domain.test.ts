import use from '@/factories/use.ts'
import Domain from './domain.ts'
import errors from './errors.ts'

let Buzz: Domain

beforeEach(async () => {
  Buzz = await use('buzz')
})

describe('domain', () => {
  test('use domain', () => {
    expect(Buzz.name).toBe('buzz')
  })
})

describe('hasRoot', () => {
  test('can check whether the domain has root if it is logined', () => {
    Buzz.login({
      metaid: import.meta.env.VITE_TEST_METAID,
    })
    expect(Buzz.hasRoot()).toBe(true)
  })

  test('can not check whether the domain has root if it is not logined', () => {
    Buzz.logout()
    expect(() => Buzz.hasRoot()).toThrow(errors.NOT_LOGINED)
  })
})

describe('auth', () => {
  test('has test metaid and address in env', async () => {
    expect(import.meta.env.VITE_TEST_METAID).toBeDefined()
    expect(import.meta.env.VITE_TEST_ADDRESS).toBeDefined()
  })

  test('can logout', () => {
    expect(Buzz.logout()).toBe(true)

    expect(Buzz.credential).toBeUndefined()
    expect(Buzz.credentialType).toBeUndefined()
  })

  test('can login with metaid', () => {
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

  test('can login with address', () => {
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

  test.todo('can login while initializing', async () => {
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

describe.todo('fluent api')
