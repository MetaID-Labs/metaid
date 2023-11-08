import { define } from '@/factories/define.js'
import { use } from '@/factories/use.js'
import { connect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/local.js'
import { MetaletWallet } from '@/wallets/metalet.js'
import type { EntitySchema } from '@/metaid-entities/entity.js'

export { define, use, connect, LocalWallet, MetaletWallet }
export type { EntitySchema }
