import { use } from '@/factories/use.js'
import { type MetaIDConnectWallet } from '../wallets/wallet.js'
import { TxComposer } from 'meta-contract'
import { type User, fetchUser, fetchMetaid, getMetaidInitFee, fetchUtxos } from '@/api.js'
import { API_AUTH_MESSAGE, DEFAULT_USERNAME, LEAST_AMOUNT_TO_CREATE_METAID } from '@/data/constants.js'
import { sleep } from '@/utils/index.js'
import type { EntitySchema } from '@/metaid-entities/entity.js'
import { load } from '@/factories/load.js'
import { errors } from '@/data/errors.js'

export class Connector {
  private _isConnected: boolean
  private wallet: MetaIDConnectWallet
  public metaid: string | undefined
  private user: User
  private constructor(wallet?: MetaIDConnectWallet) {
    this._isConnected = true

    if (wallet) {
      this.wallet = wallet
    }
  }

  get address() {
    return this.wallet.address || ''
  }

  get xpub() {
    return this.wallet.xpub || ''
  }

  public static async create(wallet?: MetaIDConnectWallet) {
    const connector = new Connector(wallet)

    if (wallet) {
      // ask api for metaid
      const metaid =
        (await fetchMetaid({
          address: wallet.address,
        })) || undefined
      connector.metaid = metaid

      if (!!metaid) {
        connector.user = await fetchUser(metaid)
      }
    }

    return connector
  }

  // metaid related
  hasUser() {
    return !!this.user
  }

  isMetaidValid() {
    return this.hasUser() && !!this.user.metaid && !!this.user.protocolTxid && !!this.user.infoTxid && !!this.user.name
  }

  getUser() {
    return this.user
  }

  async createMetaid(body?: { name: string }): Promise<User> {
    let user: any = {}
    if (this.metaid) {
      user = await fetchUser(this.metaid)

      if (user && user.metaid && user.protocolTxid && (user.infoTxid && user).name) {
        this.user = user

        return
      }
    }

    // check if has enough balance
    const biggestUtxoAmount = await fetchUtxos({ address: this.address }).then((utxos) => {
      return utxos.length
        ? utxos.reduce((prev, curr) => {
            return prev.value > curr.value ? prev : curr
          }, utxos[0]).value
        : 0
    })

    if (biggestUtxoAmount < LEAST_AMOUNT_TO_CREATE_METAID) {
      throw new Error(errors.NOT_ENOUGH_BALANCE_TO_CREATE_METAID)
    }

    // const signature = await this.signMessage(API_AUTH_MESSAGE)
    // try {
    //   await getMetaidInitFee({
    //     address: this.address,
    //     xpub: this.xpub,
    //     sigInfo: {
    //       xSignature: signature,
    //       xPublickey: await this.getPublicKey('/0/0'),
    //     },
    //   })
    // } catch (error) {
    //   console.log(error)
    // }
    if (!this.isMetaidValid()) {
      if (!user?.metaid) {
        const Metaid = await this.use('metaid-root')
        const publicKey = await this.getPublicKey('/0/0')
        const { txid } = await Metaid.createMetaidRoot(
          {
            publicKey,
          },
          Metaid.schema.nodeName
        )
        this.metaid = txid
        user.metaid = txid
      }
      await sleep(1000)
      if (!user?.protocolTxid) {
        const Protocols = await this.use('metaid-protocol')
        const publicKey = await this.getPublicKey('/0/2')
        const { txid } = await Protocols.createMetaidRoot(
          {
            publicKey,
            txid: user.metaid,
          },
          Protocols.schema.nodeName
        )
        user.protocolTxid = txid
      }
      if (!user?.infoTxid) {
        const Info = await this.use('metaid-info')
        const publicKey = await this.getPublicKey('/0/1')
        const { txid } = await Info.createMetaidRoot(
          {
            publicKey,
            txid: user.metaid,
          },
          Info.schema.nodeName
        )
        user.infoTxid = txid
      }
      if (!user?.name) {
        const Name = await this.use('metaid-name')
        const address = await this.getAddress('/0/1')
        const publicKey = await this.getPublicKey('/0/1')
        const useName = body?.name ? body.name : DEFAULT_USERNAME
        const { txid } = await Name.createMetaidRoot(
          {
            address,
            publicKey,
            txid: user.infoTxid,
            body: useName,
          },
          Name.schema.nodeName
        )
        user.name = useName
      }

      this.user = user
    }

    await sleep(1000)
    const refetchUser = await fetchUser(this.metaid)
    console.log({ refetchUser })
    return refetchUser
  }

  // metaid
  hasMetaid() {
    return !!this.metaid
  }

  use(entitySymbol: string) {
    return use(entitySymbol, { connector: this })
  }

  load(entitySchema: EntitySchema) {
    return load(entitySchema, { connector: this })
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

  signMessage(message: string, encoding: 'utf-8' | 'base64' | 'hex' | 'utf8' = 'hex') {
    return this.wallet.signMessage(message, encoding)
  }
}
