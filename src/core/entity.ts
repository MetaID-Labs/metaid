import { TxComposer, mvc } from 'meta-contract'

import { getBiggestUtxo, getBuzzes, getRootNode, getUtxos, notify } from '@/api.js'
import { connected } from '@/decorators/connected.js'
import { buildOpreturn } from '@/utils/opreturn-builder.ts'
import { Connector } from './connector.ts'
import { errors } from '@/data/errors.ts'
import { UTXO_DUST } from '@/data/constants.ts'

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

    const root = await getRootNode({
      metaid: this.metaid,
      nodeName: this.schema.nodeName,
      nodeId: this.schema.versions[0].id,
    })

    if (!root) {
      await this.createRoot()
    }

    this._root = root

    return this._root
  }

  @connected
  public async create(
    body: unknown,
    options?: {
      invisible: boolean
    },
  ) {
    const root = await this.getRoot()
    const walletAddress = mvc.Address.fromString(this.connector.address, 'mainnet' as any)

    let dustTxid = ''
    let dustValue = 0
    // 1.1 first, check if root address already has dust utxos;
    // if so, use it directly;
    const dusts = await getUtxos({ address: root.address })
    if (dusts.length > 0) {
      dustTxid = dusts[0].txid
      dustValue = dusts[0].value
    } else {
      // 1.2 otherwise, send dust to root address
      const { txid } = await this.connector.send(root.address, UTXO_DUST)
      dustTxid = txid
      dustValue = UTXO_DUST
    }

    // 2. link tx
    const randomPriv = new mvc.PrivateKey(undefined, 'mainnet')
    const randomPub = randomPriv.toPublicKey()

    let linkTxComposer = new TxComposer()
    linkTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      txId: dustTxid,
      outputIndex: 0,
      satoshis: dustValue,
    })

    const metaidOpreturn = buildOpreturn({
      publicKey: randomPub.toString(),
      parentTxid: root.txid,
      protocolName: this.schema.nodeName,
      body,
    })
    linkTxComposer.appendOpReturnOutput(metaidOpreturn)

    const biggestUtxo = await getBiggestUtxo({ address: walletAddress.toString() })
    linkTxComposer.appendP2PKHInput({
      address: walletAddress,
      txId: biggestUtxo.txid,
      outputIndex: biggestUtxo.outIndex,
      satoshis: biggestUtxo.value,
    })
    linkTxComposer.appendChangeOutput(walletAddress, 1)

    // save input-1's output for later use
    const input1Output = linkTxComposer.getInput(1).output

    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 0,
    })

    // reassign input-1's output
    linkTxComposer.getInput(1).output = input1Output
    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 1,
    })
    await this.connector.broadcast(linkTxComposer)

    await notify({ txHex: linkTxComposer.getRawHex() })

    return true
  }

  @connected
  public async createRoot() {
    const walletAddress = mvc.Address.fromString(this.connector.address, 'mainnet' as any)

    const randomPriv = new mvc.PrivateKey(undefined, 'mainnet')
    const randomPub = randomPriv.toPublicKey()

    const rootTxComposer = new TxComposer()
    // rootTxComposer.appendP2PKHInput({
    //   address: walletAddress,
    //   // txId: '00000
    // })
  }

  public async list() {
    if (this.name !== 'buzz') throw new Error(errors.NOT_SUPPORTED)

    const items = await getBuzzes({ metaid: this.metaid })

    return {
      items,
      limit: 50,
    }
  }
}
