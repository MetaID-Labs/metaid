import { useBtc } from '@/factories/use.js'
import { DEFAULT_USERNAME, LEAST_AMOUNT_TO_CREATE_METAID } from '@/data/constants.js'
import { sleep } from '@/utils/index.js'
import type { EntitySchema } from '@/metaid-entities/entity.js'
import { loadBtc } from '@/factories/load.js'
import { errors } from '@/data/errors.js'
import type { MetaIDWalletForBtc } from '@/wallets/metalet/btcWallet.js'
import {
  broadcast,
  fetchUtxos,
  getInfoByAddress,
  getRootPinByAddress,
  UserInfo,
  type Network,
  getPinListByAddress,
} from '@/service/btc'
import * as bitcoin from '../entity/btc/bitcoinjs-lib'
import { InscriptionRequest, MetaidData, Operation, PrevOutput } from '../entity/btc/inscribePsbt'
import { InscribeOptions } from '../entity/btc'
import { isNil, isEmpty } from 'ramda'

export interface NBD {
  no: { commitTxId: string; revealTxIds: string[]; commitCost: string; revealCost: string; status?: string }
  yes: { commitTxHex: string; revealTxsHex: string[]; commitCost: string; revealCost: string; status?: string }
}
export class BtcConnector {
  private _isConnected: boolean
  private wallet: MetaIDWalletForBtc
  public metaid: string | undefined
  private user: UserInfo
  private constructor(wallet?: MetaIDWalletForBtc) {
    this._isConnected = true

    if (wallet) {
      this.wallet = wallet as MetaIDWalletForBtc
    }
  }

  get address() {
    return this.wallet?.address || ''
  }

  public static async create(wallet?: MetaIDWalletForBtc) {
    const connector = new BtcConnector(wallet)

    if (wallet) {
      // ask api for metaid and user
      // const rootPin = await getRootPinByAddress({ address: wallet.address })
      // const metaid = rootPin?.rootTxId
      // if (!!metaid) {
      //   connector.metaid = metaid

      //   const user = await getInfoByAddress({ address: wallet.address })
      //   connector.user = user
      // }

      const metaidInfo = await getInfoByAddress({ address: wallet.address })
      if (!isNil(metaidInfo)) {
        connector.metaid = metaidInfo.rootTxId + 'i0'
        connector.user = metaidInfo
      }
    }

    return connector
  }

  // metaid related
  hasUser() {
    return !!this.user
  }

  async getUser(currentAddress?: string) {
    let res: UserInfo
    if (!isNil(currentAddress)) {
      res = await getInfoByAddress({ address: currentAddress })
    } else {
      res = await getInfoByAddress({ address: this.address })
    }

    return res
  }

  public async inscribe<T extends keyof NBD>(inscribeOptions: InscribeOptions[], noBroadcast: T): Promise<NBD[T]> {
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
    const metaidDataList: MetaidData[] = inscribeOptions.map((inp) => ({
      operation: inp.operation,
      revealAddr: this.address,
      body: inp?.body,
      path: inp?.path,
      contentType: inp?.contentType,
      encryption: inp?.encryption,
      version: '1.0.0', //this._schema.versions[0].version.toString(),
      encoding: inp?.encoding,
    }))

    const request: InscriptionRequest = {
      // commitTxPrevOutputList,
      feeRate: 2,
      revealOutValue: 546,
      metaidDataList,
      changeAddress: this.address,
    }
    console.log('request', request, 'noBroadcast', noBroadcast === 'no' ? false : true)
    const res = await this.wallet.inscribe({
      data: request,
      options: {
        noBroadcast: noBroadcast === 'no' ? false : true,
      },
    })
    console.log('inscrible res', res)
    return res
  }

  async updatUserInfo(body?: { name?: string; bio?: string; avatar?: string }): Promise<boolean> {
    let nameRevealId = ''
    let bioRevealId = ''
    let avatarRevealId = ''
    // path 传@pinId
    if (body?.name !== this.user?.name && !isNil(body?.name) && !isEmpty(body?.name)) {
      let nameRes
      if (this.user?.nameId === '') {
        nameRes = await this.inscribe([{ operation: 'create', body: body?.name, path: `/info/name` }], 'no')
      } else {
        nameRes = await this.inscribe(
          [{ operation: 'modify', body: body?.name, path: `@${this?.user?.nameId ?? ''}` }],
          'no'
        )
      }
      if (!isNil(nameRes?.revealTxIds[0])) {
        nameRevealId = nameRes.revealTxIds[0]
      }
    }
    if (body?.bio !== this.user?.bio && !isNil(body?.bio) && !isEmpty(body?.bio)) {
      console.log('run in bio')
      let bioRes
      if (this.user?.bioId === '') {
        bioRes = await this.inscribe([{ operation: 'create', body: body?.bio, path: `/info/bio` }], 'no')
      } else {
        bioRes = await this.inscribe(
          [{ operation: 'modify', body: body?.bio, path: `@${this?.user?.bioId ?? ''}` }],
          'no'
        )
      }
      if (!isNil(bioRes?.revealTxIds[0])) {
        bioRevealId = bioRes.revealTxIds[0]
      }
    }
    if (body?.avatar !== this.user?.avatar && !isNil(body?.avatar) && !isEmpty(body?.avatar)) {
      let avatarRes
      if (this.user?.avatarId === '') {
        avatarRes = await this.inscribe(
          [{ operation: 'create', body: body?.avatar, path: `/info/avatar`, encoding: 'base64' }],
          'no'
        )
      } else {
        avatarRes = await this.inscribe(
          [{ operation: 'modify', body: body?.avatar, path: `@${this?.user?.avatarId ?? ''}`, encoding: 'base64' }],
          'no'
        )
      }
      if (!isNil(avatarRes?.revealTxIds[0])) {
        avatarRevealId = avatarRes.revealTxIds[0]
      }
    }

    if (nameRevealId !== '' || bioRevealId !== '' || avatarRevealId !== '') {
      return true
    } else {
      return false
    }
  }

  async createMetaid(body?: {
    name?: string
    bio?: string
    avatar?: string
  }): Promise<{ metaid: string; cost: number }> {
    const initRes = await this.inscribe([{ operation: 'init' }], 'no')
    let cost = 0
    console.log(!isNil(initRes?.revealTxIds) && !isEmpty(initRes?.revealTxIds))
    if (!isNil(initRes?.revealTxIds) && !isEmpty(initRes?.revealTxIds)) {
      const metaid = initRes.revealTxIds[0]
      this.metaid = metaid
      cost += Number(initRes?.revealCost ?? 0) + Number(initRes?.commitCost ?? 0)
      if (!!body?.name) {
        const nameRes = await this.inscribe(
          [{ operation: 'create', body: body?.name, path: '/info/name' }],

          'no'
        )
        cost += Number(nameRes?.revealCost ?? 0) + Number(nameRes?.commitCost ?? 0)
      }
      if (!!body?.bio) {
        const bioRes = await this.inscribe(
          [{ operation: 'create', body: body?.bio, path: '/info/bio' }],

          'no'
        )
        cost += Number(bioRes?.revealCost ?? 0) + Number(bioRes?.commitCost ?? 0)
      }
      if (!!body?.avatar) {
        const avatarRes = await this.inscribe(
          [{ operation: 'create', body: body?.avatar, path: '/info/avatar', encoding: 'base64' }],

          'no'
        )
        cost += Number(avatarRes?.revealCost ?? 0) + Number(avatarRes?.commitCost ?? 0)
      }
    }
    return { metaid: this.metaid, cost }
  }

  // metaid
  hasMetaid() {
    return !!this.metaid
  }

  getMetaid() {
    return this.metaid
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
