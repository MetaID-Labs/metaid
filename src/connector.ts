import { use } from '@/factories/use.ts'
import { IWallet } from './wallets/wallet.ts'
import { TxComposer } from 'meta-contract'

export class Connector {
  private _isConnected: boolean
  private wallet: IWallet
  public metaid: string | undefined
  public address: string | undefined

  constructor(wallet: IWallet) {
    this._isConnected = true

    this.wallet = wallet
    this.metaid = wallet.metaid
    this.address = wallet.address
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
