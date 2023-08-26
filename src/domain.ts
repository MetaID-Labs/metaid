import errors from './errors.ts'

type Credential = {
  metaid?: string
  address?: string
}

// decorator
function needsCredential(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    if (!this.credential) {
      throw new Error(errors.NOT_LOGINED)
    }

    return originalMethod.apply(this, args)
  }

  return descriptor
}
class Domain {
  public credential: Credential | undefined
  private _name: string

  constructor(name: string) {
    this._name = name
  }

  get name() {
    return this._name
  }

  get credentialType(): 'metaid' | 'address' {
    if (!this.credential) return undefined

    return this.credential?.metaid ? 'metaid' : 'address'
  }

  public login(credential: Credential) {
    this.credential = credential

    return true
  }

  public logout() {
    this.credential = undefined

    return true
  }

  @needsCredential
  public hasRoot() {
    return true
  }
}

export default Domain
