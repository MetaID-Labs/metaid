import { useBtc } from '@/factories/use.js'
import { DEFAULT_USERNAME, LEAST_AMOUNT_TO_CREATE_METAID } from '@/data/constants.js'
import { sleep } from '@/utils/index.js'
import type { EntitySchema } from '@/metaid-entities/entity.js'
import { loadBtc } from '@/factories/load.js'
import { errors } from '@/data/errors.js'
import type { Blockchain } from '@/types/index.js'
import type { MetaIDWalletForBtc } from '@/wallets/metalet/btcWallet.js'
import { broadcast, getRootPinByAddress, type Network } from '@/service/btc'
import * as bitcoin from '../entity/btc/bitcoinjs-lib'

export class BtcConnector {
  private _isConnected: boolean
  private wallet: MetaIDWalletForBtc
  public blockchain: Blockchain
  public metaid: string | undefined
  private user: string
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
      // // ask api for metaid
      const rootPin = await getRootPinByAddress({ address: wallet.address })
      const metaid = rootPin.rootTxId
      connector.metaid = metaid
      // const metaid =
      //   (await fetchMetaid({
      //     address: wallet.address,
      //   })) || undefined
      // connector.metaid = metaid
      // // ask api for user
      // if (!!metaid) {
      //   connector.user = await fetchUser(metaid)
      // }
    }

    return connector
  }

  // metaid related
  hasUser() {
    return !!this.user
  }

  isMetaidValid() {
    return true
  }

  getUser() {
    return this.user
  }

  async createMetaid(body?: { name: string }): Promise<string> {
    const initEntity = await this.use('metaid-root')
    const metaid = await initEntity.inscribe('init', this.address, bitcoin.networks.testnet)

    return metaid
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
