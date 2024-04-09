import type { MetaIDWalletForBtc } from '@/wallets/metalet/btcWallet.js'
import { NBD } from './btc'
import { Network, UserInfo } from '@/service/btc'
import { InscribeOptions } from '../entity/btc'
import type { EntitySchema } from '@/metaid-entities/entity.js'

export declare class IBtcConnector {
  private _isConnected
  private wallet
  metaid: string | undefined
  private user
  private constructor()
  get address(): string
  static create(wallet?: MetaIDWalletForBtc): Promise<IBtcConnector>
  hasUser(): boolean
  getUser(currentAddress?: string): Promise<UserInfo>
  inscribe<T extends keyof NBD>(inscribeOptions: InscribeOptions[], noBroadcast: T, feeRate?: number): Promise<NBD[T]>
  updatUserInfo(body?: { name?: string; bio?: string; avatar?: string; feeRate?: number }): Promise<boolean>
  createMetaid(body?: { name?: string; bio?: string; avatar?: string; feeRate?: number }): Promise<{
    metaid: string
    cost: number
  }>
  hasMetaid(): boolean
  getMetaid(): string
  use(entitySymbol: string): Promise<import('../entity/btc').BtcEntity>
  load(entitySchema: EntitySchema): Promise<import('../entity/btc').BtcEntity>
  isConnected(): boolean
  disconnect(): void
  /**
   * wallet delegation
   * signInput / send / broadcast / getPublicKey / getAddress / signMessage / pay
   */
  signPsbt(psbtHex: string, options?: any): Promise<string>
  broadcast(
    txHex: string,
    network: Network,
    publicKey: string,
    message?: string | undefined
  ): Promise<{
    data: any
    code: number
    message: string
  }>
  getPublicKey(path?: string): Promise<string>
  getAddress(path?: string): Promise<string>
  signMessage(message: string, encoding?: 'utf-8' | 'base64' | 'hex' | 'utf8'): Promise<string>
}
