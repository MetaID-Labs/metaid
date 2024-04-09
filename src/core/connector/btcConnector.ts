import { UserInfo } from '@/service/btc'
import { NBD } from './btc'
import { BtcEntity, InscribeOptions } from '../entity/btc'
import { EntitySchema } from '@/metaid-entities/entity'
import { MetaIDWalletForBtc } from '@/wallets/metalet/btcWallet'

export interface BtcConnectorStatic {
  create: (wallet?: MetaIDWalletForBtc) => Promise<IBtcConnector>
}

export type IBtcConnector = {
  metaid: string | undefined
  address: string
  hasUser(): boolean
  inscribe<T extends keyof NBD>(inscribeOptions: InscribeOptions[], noBroadcast: T, feeRate?: number): Promise<NBD[T]>
  updatUserInfo(body?: { name?: string; bio?: string; avatar?: string; feeRate?: number }): Promise<boolean>
  createMetaid(body?: { name?: string; bio?: string; avatar?: string; feeRate?: number }): Promise<{
    metaid: string
    cost: number
  }>
  hasMetaid(): boolean
  getMetaid(): string
  use(entitySymbol: string): Promise<BtcEntity>
  load(entitySchema: EntitySchema): Promise<BtcEntity>
  isConnected(): boolean
  disconnect(): void
}
