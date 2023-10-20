import { use } from '@/factories/use.js'
import { type MetaIDConnectWallet } from '../wallets/wallet.js'
import { TxComposer } from 'meta-contract'
import { type User, fetchUser, fetchMetaid } from '@/api.js'

export class Connector {
  private _isConnected: boolean
  private wallet: MetaIDConnectWallet
  public metaid: string | undefined
  private user: User
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

    // ask api for metaid
    const metaid =
      (await fetchMetaid({
        address: wallet.address,
      })) || undefined
    connector.metaid = metaid

    if (!!metaid) {
      connector.user = await fetchUser(metaid)
    }
    return connector
  }

  // user
  hasUser() {
    return !!this.user
  }

  getUser() {
    return this.user
  }

  async createUser(body?: { name: string }): Promise<User> {
    let metaidBaseNodeInfo: Partial<User> = {
      metaid: '',
      protocolTxId: '',
      infoTxId: '',
      name: '',
    }
    try {
      if (this.metaid) {
        const accountInfo = await getUser(this.metaid)
        metaidBaseNodeInfo = accountInfo
        if (
          metaidBaseNodeInfo.metaId &&
          metaidBaseNodeInfo.protocolTxId &&
          (metaidBaseNodeInfo.infoTxId && metaidBaseNodeInfo).name
        ) {
          this.userInfo = metaidBaseNodeInfo
        }
      } else {
        const signature = await this.connector.signMessage(import.meta.env.VITE_SIGN_MSG)
        try {
          await getMetaidInitFee({
            address: this.address,
            xpub: this.connector.xpub,
            sigInfo: {
              xSignature: signature,
              xPublickey: await this.connector.getPublicKey('/0/0'),
            },
          })
        } catch (error) {
          console.log(error)
        }
      }
      if (
        !metaidBaseNodeInfo?.metaId ||
        !metaidBaseNodeInfo?.protocolTxId ||
        !metaidBaseNodeInfo?.infoTxId ||
        (!metaidBaseNodeInfo?.name && Array.isArray(this.schema))
      ) {
        let address, publicKey
        for (let i of this.schema) {
          if (i.nodeName === 'Root' && !metaidBaseNodeInfo.metaId) {
            publicKey = await this.connector.getPublicKey('/0/0')
            const { txid } = await this.createMetaidRoot(
              {
                publicKey,
              },
              i.nodeName
            )
            metaidBaseNodeInfo.metaId = txid
          }
          if (i.nodeName === 'Protocols' && !metaidBaseNodeInfo.protocolTxId) {
            publicKey = await this.connector.getPublicKey('/0/2')
            const { txid } = await this.createMetaidRoot(
              {
                publicKey,
                txid: metaidBaseNodeInfo.metaId,
              },
              i.nodeName
            )
            metaidBaseNodeInfo.protocolTxId = txid
          }
          if (i.nodeName === 'Info' && !metaidBaseNodeInfo.infoTxId) {
            publicKey = await this.connector.getPublicKey('/0/1')
            const { txid } = await this.createMetaidRoot(
              {
                publicKey,
                txid: metaidBaseNodeInfo.metaId,
              },
              i.nodeName
            )
            metaidBaseNodeInfo.infoTxId = txid
          }
          if (i.nodeName === 'name' && !metaidBaseNodeInfo.name) {
            address = await this.connector.getAddress('/0/1')
            publicKey = await this.connector.getPublicKey('/0/1')
            await this.createMetaidRoot(
              {
                address,
                publicKey,
                txid: metaidBaseNodeInfo.infoTxId,
                body: body.name ? body.name : import.meta.env.VITE_DefaultName,
              },
              i.nodeName
            )
            metaidBaseNodeInfo.name = body.name
          }
          this.userInfo = metaidBaseNodeInfo
          console.log('register metaid', this.userInfo)
        }
      }
      return this.userInfo
    } catch (error) {
      throw new Error(error)
    }
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
   * signInput / send / broadcast / getPublicKey / getAddress / signMessage
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
    return this.wallet.signMessage(message, 'hex')
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
