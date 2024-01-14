import type { User } from '@/api.js'
import type { Connector } from '../connector.js'

export interface BaseEntity {
  connector: Connector | undefined
  _name: string
  _schema: any
  userInfo: User
  create(body: unknown, options?: any): { txid: string }
}
