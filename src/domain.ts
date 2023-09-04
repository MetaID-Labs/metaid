import { TxComposer, Wallet, mvc } from 'meta-contract'

import { getRootNode, notify } from '@/api.ts'
import needsCredential from '@/decorators/needs-credential.ts'
import buildOpreturn from './utils/opreturn-builder.ts'

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
  public async create(body: unknown) {
    const root = await this.getRoot()
    console.log({ root })
    return

    const mnemonic = mvc.Mnemonic.fromString(import.meta.env.VITE_TEST_MNEMONIC)
    const hdpk = mnemonic.toHDPrivateKey(undefined, 'mainnet' as any)
    const basePk = hdpk.deriveChild(`m/44'/236'/0'/0`)

    let deriver = 0
    let rootPriv: any
    while (deriver < 100) {
      const childPk = basePk.deriveChild(deriver)
      const childAddr = childPk.publicKey.toAddress('mainnet' as any)
      const childAddrStr = childAddr.toString()
      console.log({ childAddrStr })

      if (childAddrStr === root.address) {
        rootPriv = childPk.privateKey
        break
      }

      deriver++
    }

    // find corresponding public key

    const privateKey = mvc.PrivateKey.fromString(import.meta.env.VITE_TEST_PRIVATE_KEY)
    const wif = privateKey.toWIF()
    const wallet = new Wallet(wif, 'mainnet' as any, 1)

    // const sendRes = await wallet.send(root.address, 1000)
    const sendTxComposer = new TxComposer()
    const preSendRes = await wallet.send(root.address, 2000)
    sendTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      txId: preSendRes.txId,
      outputIndex: 0,
      satoshis: 2000,
    })
    sendTxComposer.appendP2PKHOutput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      satoshis: 1200,
    })
    sendTxComposer.appendOpReturnOutput([])
    sendTxComposer.appendChangeOutput(wallet.address, 1)
    sendTxComposer.unlockP2PKHInput(rootPriv, 0)
    const sendRes = await wallet.api.broadcast(sendTxComposer.getRawHex())

    const sendTx = sendTxComposer.getTx()
    const usingUtxo = sendTx.outputs[0]
    console.log({ usingUtxo })
    const txComposer = new TxComposer()

    console.log({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      txId: sendRes,
      outputIndex: 0,
      satoshis: usingUtxo.satoshis,
    })

    txComposer.appendP2PKHInput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      txId: sendRes,
      outputIndex: 0,
      satoshis: usingUtxo.satoshis,
    })

    const randomPriv = new mvc.PrivateKey(undefined, 'mainnet')
    const randomPub = randomPriv.toPublicKey()
    const randomAddr = randomPub.toAddress()

    const metaidOpreturn = buildOpreturn({
      publicKey: randomPub.toString(),
      parentTxid: root.txid,
      protocolName: this.schema.nodeName,
      body,
    })

    txComposer.appendOpReturnOutput(metaidOpreturn)
    txComposer.appendChangeOutput(wallet.address, 1)
    txComposer.unlockP2PKHInput(rootPriv, 0)

    const broadcastRes = await wallet.api.broadcast(txComposer.getRawHex())
    console.log({ broadcastRes })

    await notify(sendTxComposer.getRawHex())
    await notify(txComposer.getRawHex())

    return true
  }
}

export default Domain
