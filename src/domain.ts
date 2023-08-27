import { getRootNode } from '@/api.ts'
import needsCredential from '@/decorators/needs-credential.ts'

type Credential = {
  metaid?: string
  address?: string
}

type Root = {
  id: string
  nodeName: string
  address: string
  txid: string
  publicKey: string
  parentTxid: string
  parentPublicKey: string
  version: string
  createdAt: number
}

class Domain {
  public credential: Credential | undefined
  private _name: string
  private _schema: any
  private _root: Root

  constructor(name: string, schema: any) {
    this._name = name
    this._schema = schema
  }

  get name() {
    return this._name
  }

  get schema() {
    return this._schema
  }

  get root() {
    return this._root
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

  @needsCredential
  public async getRoot() {
    if (this._root) return this._root

    this._root = await getRootNode({
      metaid: this.credential.metaid,
      nodeName: this.schema.nodeName,
      nodeId: this.schema.versions[0].id,
    })

    return this._root
  }

  @needsCredential
  public create(body) {
    return true
  }
}

export default Domain
