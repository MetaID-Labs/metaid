import { use } from '@/factories/use.js'
import { MetaIDConnectWallet } from '../wallets/wallet.ts'
import { TxComposer } from 'meta-contract'
import { getMetaid } from '@/api.ts'

export class Connector {
  private _isConnected: boolean
  private wallet: MetaIDConnectWallet
  public metaid: string | undefined
  public address: string | undefined

  private constructor(wallet: MetaIDConnectWallet) {
    this._isConnected = true

    this.wallet = wallet
    this.address = wallet.address
  }

  public static async create(wallet: MetaIDConnectWallet) {
    const connector = new Connector(wallet)

    // ask api for metaid
    connector.metaid =
      (await getMetaid({
        address: wallet.address,
      })) || undefined

    return connector
  }

  // metaid
  hasMetaid() {
    return !!this.metaid
  }

  use(entitySymbol: string) {
    return use(entitySymbol, { connector: this })
  }

  isConnected() {
    return this._isConnected
  }

  disconnect() {
    this._isConnected = false
  }

  /**
   * wallet delegation
   * signP2pkh / send / broadcast
   */
  signP2pkh(txComposer: TxComposer, inputIndex: number) {
    return this.wallet.signP2pkh(txComposer, inputIndex)
  }

  send(toAddress: string, amount: number) {
    return this.wallet.send(toAddress, amount)
  }

  broadcast(txComposer: TxComposer) {
    return this.wallet.broadcast(txComposer)
  }
}
