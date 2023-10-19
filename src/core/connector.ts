import { use } from '@/factories/use.js'
import { type MetaIDConnectWallet } from '../wallets/wallet.js'
import { TxComposer } from 'meta-contract'
import { type User, getUser, getMetaid } from '@/api.js'

export class Connector {
  private _isConnected: boolean
  private wallet: MetaIDConnectWallet
  public metaid: string | undefined
  public user: User
  private constructor(wallet: MetaIDConnectWallet) {
    this._isConnected = true

    this.wallet = wallet
  }

  get address() {
    return this.wallet.address
  }

  get xpub() {
    return this.wallet.xpub
  }

  public static async create(wallet: MetaIDConnectWallet) {
    const connector = new Connector(wallet)
    console.log({ wallet })

    // ask api for metaid
    const metaid =
      (await getMetaid({
        address: wallet.address,
      })) || undefined
    connector.metaid = metaid

    if (!!metaid) {
      connector.user = await getUser(metaid)
    }
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
   * signInput / send / broadcast
   */
  signInput({ txComposer, inputIndex }: { txComposer: TxComposer; inputIndex: number }) {
    return this.wallet.signInput({ txComposer, inputIndex })
  }

  send(toAddress: string, amount: number) {
    return this.wallet.send(toAddress, amount)
  }

  broadcast(txComposer: TxComposer) {
    return this.wallet.broadcast(txComposer)
  }

  getPublicKey(path?: string) {
    return this.wallet.getPublicKey(path)
  }

  getAddress(path?: string) {
    return this.wallet.getAddress(path)
  }

  signMessage(
    message: string
    // privateKey: mvc.PrivateKey,
    // encoding?: "utf-8" | "base64" | "hex" | "utf8"
  ) {
    return this.wallet.signMessage(message, "hex");
  }

  // public getMetaID() {
  //   return new Promise<any>(async (resovle, reject) => {
  //     try {
  //       const userInfo = await this.entity.getMetaidBaseRoot();
  //       resovle(userInfo);
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // }
}
