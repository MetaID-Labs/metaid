import { TxComposer, mvc } from 'meta-contract'

import { getBuzzes, getRootNode, notify } from '@/api.js'
import { connected } from '@/decorators/connected.js'
import { buildOpreturn } from './utils/opreturn-builder.js'
import { Connector } from './connector.js'
import { errors } from './data/errors.js'

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

export class Entity {
  // public credential: Credential | undefined
  public connector: Connector | undefined
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

  public isConnected() {
    return this.connector?.isConnected() ?? false
  }

  public disconnect() {
    this.connector?.disconnect()
  }

  get address() {
    return this.connector?.address
  }

  get metaid() {
    return this.connector?.metaid
  }

  get root() {
    return this._root
  }

  @connected
  public hasRoot() {
    return true
  }

  @connected
  public async getRoot() {
    if (this._root) return this._root

    this._root = await getRootNode({
      metaid: this.metaid,
      nodeName: this.schema.nodeName,
      nodeId: this.schema.versions[0].id,
    })

    return this._root
  }

  @connected
  public async create(body: unknown) {
    const root = await this.getRoot()

    const preSendRes = await this.connector.send(root.address, 2000)
    const sendTxComposer = new TxComposer()
    sendTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      txId: preSendRes.txid,
      outputIndex: 0,
      satoshis: 2000,
    })
    sendTxComposer.appendP2PKHOutput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      satoshis: 1200,
    })
    const walletAddress = mvc.Address.fromString(this.connector.address, 'mainnet' as any)
    sendTxComposer.appendChangeOutput(walletAddress, 1)
    this.connector.signP2pkh(sendTxComposer, 0)
    const sendRes = await this.connector.broadcast(sendTxComposer)

    const sendTx = sendTxComposer.getTx()
    const usingUtxo = sendTx.outputs[0]
    console.log({ usingUtxo })
    const txComposer = new TxComposer()

    // console.log({
    //   address: mvc.Address.fromString(root.address, 'mainnet' as any),
    //   txId: sendRes,
    //   outputIndex: 0,
    //   satoshis: usingUtxo.satoshis,
    // })

    txComposer.appendP2PKHInput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      txId: sendRes.txid,
      outputIndex: 0,
      satoshis: usingUtxo.satoshis,
    })

    const randomPriv = new mvc.PrivateKey(undefined, 'mainnet')
    const randomPub = randomPriv.toPublicKey()
    const metaidOpreturn = buildOpreturn({
      publicKey: randomPub.toString(),
      parentTxid: root.txid,
      protocolName: this.schema.nodeName,
      body,
    })

    txComposer.appendOpReturnOutput(metaidOpreturn)
    txComposer.appendChangeOutput(walletAddress, 1)
    this.connector.signP2pkh(txComposer, 0)

    const broadcastRes = await this.connector.broadcast(txComposer)
    console.log({ broadcastRes })

    await notify({ txHex: txComposer.getRawHex() })

    return true
  }

  public async list() {
    if (this.name !== 'buzz') throw new Error(errors.NOT_SUPPORTED)
    console.log('here')

    const items = await getBuzzes({ metaid: this.metaid })

    return {
      items,
      limit: 50,
    }
  }
}
