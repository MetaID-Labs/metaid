import { staticImplements } from '@/utils/index.ts'
import { MetaIDConnectWallet, WalletStatic } from './wallet.ts'
import { TxComposer } from 'meta-contract'
import { errors } from '@/data/errors.ts'

// @staticImplements<WalletStatic>()
// export class MetaletWallet implements MetaIDConnectWallet {
export class MetaletWallet {
  public address: string | undefined

  private constructor() {}

  static async create(): Promise<any> {
    // if it's not in the browser, throw an error
    if (typeof window === 'undefined') {
      throw new Error(errors.MUST_BE_IN_BROWSER)
    }

    await window.metaidwallet.connect()
  }

  public hasAddress() {
    return !!this.address
  }

  public signP2pkh(txComposer: TxComposer, inputIndex: number): any {}

  public send(toAddress: string, amount: number): any {}

  public broadcast(txComposer: TxComposer): any {}
}
