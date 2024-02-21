import { useBtc } from '@/factories/use.js'
import { DEFAULT_USERNAME, LEAST_AMOUNT_TO_CREATE_METAID } from '@/data/constants.js'
import { sleep } from '@/utils/index.js'
import type { EntitySchema } from '@/metaid-entities/entity.js'
import { loadBtc } from '@/factories/load.js'
import { errors } from '@/data/errors.js'
import type { Blockchain } from '@/types/index.js'
import type { MetaIDWalletForBtc } from '@/wallets/metalet/btcWallet.js'
import { broadcast, fetchUtxos, getInfoByAddress, getRootPinByAddress, type Network } from '@/service/btc'
import * as bitcoin from '../entity/btc/bitcoinjs-lib'
import { InscriptionRequest, MetaidData, Operation, PrevOutput } from '../entity/btc/inscribePsbt'
import { InscribeOptions } from '../entity/btc'

type User = {
  metaid: string
  address: string
  name: string
  avatar: string | null
  bio: string
}

export interface NBD {
  no: { commitTxId: string; revealTxIds: string[] }
  yes: { commitTxHex: string; revealTxsHex: string[] }
}
export class BtcConnector {
  private _isConnected: boolean
  private wallet: MetaIDWalletForBtc
  public blockchain: Blockchain
  public metaid: string | undefined
  private user: User
  private constructor(wallet?: MetaIDWalletForBtc) {
    this._isConnected = true

    if (wallet) {
      this.wallet = wallet as MetaIDWalletForBtc
    }
  }

  get address() {
    return this.wallet.address || ''
  }

  public static async create(wallet?: MetaIDWalletForBtc) {
    const connector = new BtcConnector(wallet)

    if (wallet) {
      // ask api for metaid and user
      const rootPin = await getRootPinByAddress({ address: wallet.address })
      const metaid = rootPin?.rootTxId
      if (!!metaid) {
        connector.metaid = metaid

        const user = await getInfoByAddress({ address: wallet.address })
        connector.user = {
          metaid: user.rootTxId,
          address: user.address,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
        }
      }
    }

    return connector
  }

  // metaid related
  hasUser() {
    return !!this.user
  }

  getUser() {
    return this.user
  }

  public async inscribe<T extends keyof NBD>(
    operation: Operation,
    address: string,
    noBroadcast: T,
    inscribeOptions?: InscribeOptions | undefined
  ): Promise<NBD[T]> {
    // const faucetUtxos = await fetchUtxos({
    //   address: address,
    //   network: 'testnet',
    // })
    // const toUseUtxo = faucetUtxos[0] // presume toUseUtxo.value >= 11546
    // console.log('to use utxo have satoshi', toUseUtxo.satoshi)

    // const pub = await this.getPublicKey(`m/86'/0'/0'/0/0`)
    // const commitTxPrevOutputList: PrevOutput[] = [
    //   {
    //     txId: toUseUtxo.txId,
    //     vOut: toUseUtxo.vout,
    //     amount: toUseUtxo.satoshi,
    //     address: address,
    //     pub,
    //   },
    // ]
    const metaidDataList: MetaidData[] = [
      {
        operation,
        revealAddr: address,
        body: inscribeOptions?.body,
        path: inscribeOptions?.path,
        contentType: inscribeOptions?.contentType,
        encryption: inscribeOptions?.encryption,
        version: '1.0.0', //this._schema.versions[0].version.toString(),
        encoding: inscribeOptions?.encoding,
      },
    ]

    const request: InscriptionRequest = {
      // commitTxPrevOutputList,
      commitFeeRate: 1,
      revealFeeRate: 1,
      revealOutValue: 546,
      metaidDataList,
      changeAddress: address,
    }
    console.log('request', request)
    const res = this.wallet.inscribe({
      data: request,
      options: {
        noBroadcast: noBroadcast === 'no' ? false : true,
      },
    })

    return res
  }

  async createMetaid(body?: { name?: string }): Promise<string> {
    const initRes = await this.inscribe('init', this.address, 'no')
    const metaid = initRes.revealTxIds[0]
    this.metaid = metaid
    if (!!body?.name) {
      const nameRes = await this.inscribe('create', this.address, 'no', { body: body?.name, path: '/info/name' })
    }
    return metaid
    // const initEntity = await this.use('metaid-root')
    // const metaid = await initEntity.inscribe('init', this.address, bitcoin.networks.testnet)
    // const userEntity = await this.use('info')
    // const userInfo =  await userEntity.create()
    // this.metaid = metaid
    // this.user = userInfo
  }

  // metaid
  hasMetaid() {
    return !!this.metaid
  }

  use(entitySymbol: string) {
    return useBtc(entitySymbol, { connector: this })
  }

  load(entitySchema: EntitySchema) {
    return loadBtc(entitySchema, { connector: this })
  }

  isConnected() {
    return this._isConnected
  }

  disconnect() {
    this._isConnected = false
    this.wallet = undefined
  }

  /**
   * wallet delegation
   * signInput / send / broadcast / getPublicKey / getAddress / signMessage / pay
   */
  async signPsbt(psbtHex: string, options?: any) {
    if (options) {
      return await this.wallet.signPsbt(psbtHex, options)
    }
    return await this.wallet.signPsbt(psbtHex)
  }

  async broadcast(txHex: string, network: Network, publicKey: string, message: string | undefined = '') {
    return await broadcast({
      rawTx: txHex,
      network,
      publicKey,
      message,
    })
  }

  getPublicKey(path?: string) {
    return this.wallet.getPublicKey(path)
  }

  getAddress(path?: string) {
    return this.wallet.getAddress({ path })
  }

  signMessage(message: string, encoding: 'utf-8' | 'base64' | 'hex' | 'utf8' = 'hex') {
    return this.wallet.signMessage(message, encoding)
  }
}
