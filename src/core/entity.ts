import { TxComposer, mvc } from 'meta-contract'

import { getUser, getBiggestUtxo, getBuzzes, getRootCandidate, getRootNode, getUtxos, notify } from '@/api.js'
import { connected } from '@/decorators/connected.js'
import { buildRootOpreturn, buildOpreturn } from '@/utils/opreturn-builder.js'
import { Connector } from './connector.js'
import { errors } from '@/data/errors.js'
import { UTXO_DUST } from '@/data/constants.js'
import { sleep } from '@/utils/index.js'

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
  public async getRoot(): Promise<Partial<Root>> {
    if (this._root) return this._root

    const root = await getRootNode({
      metaid: this.metaid,
      nodeName: this.schema.nodeName,
      nodeId: this.schema.versions[0].id,
    })
    this._root = root

    if (!this._root) {
      const user = await getUser(this.metaid)

      if (user.metaId) {
        const protocolAddress = await this.connector.getAddress('/0/2')
        const rootCandidate = await getRootCandidate({
          xpub: this.connector.xpub,
          parentTxId: user.protocolTxId,
        })

        const { txid } = await this.createRoot({
          protocolAddress,
          protocolTxid: user.protocolTxId,

          candidatePublicKey: rootCandidate.publicKey,
        })

        await sleep(1000)

        // re fetch
        const root = await getRootNode({
          metaid: this.metaid,
          nodeName: this.schema.nodeName,
          nodeId: this.schema.versions[0].id,
        })
        if (!root) throw new Error(errors.FAILED_TO_CREATE_ROOT)

        this._root = root
      }
    }

    return this._root
  }

  @connected
  private async createRoot({
    protocolAddress,
    protocolTxid,
    candidatePublicKey,
  }: {
    protocolAddress: string
    protocolTxid: string
    candidatePublicKey: string
  }) {
    const walletAddress = mvc.Address.fromString(this.connector.address, 'mainnet' as any)

    let dustTxid = ''
    let dustValue = 0
    // 1.1 first, check if protocol address already has dust utxos;
    // if so, use it directly;
    const dusts = await getUtxos({ address: protocolAddress })
    if (dusts.length > 0) {
      dustTxid = dusts[0].txid
      dustValue = dusts[0].value
    } else {
      // 1.2 otherwise, send dust to root address
      const { txid } = await this.connector.send(protocolAddress, UTXO_DUST)
      dustTxid = txid
      dustValue = UTXO_DUST
    }

    // 2. link tx
    let linkTxComposer = new TxComposer()
    linkTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(protocolAddress, 'mainnet' as any),
      txId: dustTxid,
      outputIndex: 0,
      satoshis: dustValue,
    })

    const metaidOpreturn = buildRootOpreturn({
      publicKey: candidatePublicKey,
      parentTxid: protocolTxid,
      protocolName: this.schema.nodeName,
      body: undefined,
    })
    linkTxComposer.appendOpReturnOutput(metaidOpreturn)

    const biggestUtxo = await getBiggestUtxo({
      address: walletAddress.toString(),
    })
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
    const { txid } = await this.connector.broadcast(linkTxComposer)

    await notify({ txHex: linkTxComposer.getRawHex() })

    return { txid }
  }

  @connected
  public async create(
    body: unknown,
    options?: {
      invisible: boolean
    }
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
    const { txid } = await this.connector.broadcast(linkTxComposer)

    await notify({ txHex: linkTxComposer.getRawHex() })

    return { txid }
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
