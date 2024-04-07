import { define } from '@/factories/define.js'
import { useMvc, useBtc } from '@/factories/use.js'
import { mvcConnect, btcConnect } from '@/factories/connect.js'
import { LocalWallet } from '@/wallets/localwallet/local.js'
import { MetaletWalletForMvc } from '@/wallets/metalet/mvc.js'
import { MetaletWalletForBtc } from './wallets/metalet/btc.js'
import { Psbt } from '@/core/entity/btc/bitcoinjs-lib/psbt'
import { Transaction } from './core/entity/btc/bitcoinjs-lib/transaction.js'

import type { EntitySchema } from '@/metaid-entities/entity.js'
import type { MetaletWalletForBtc as IMetaletWalletForBtc } from './wallets/metalet/btc.js'
import type { BtcConnector as IBtcConnector } from './core/connector/btc.js'
import type { BtcEntity as IBtcEntity } from './core/entity/btc/index.js'
import type { CreateOptions } from '@/core/entity/btc'

export {
  Psbt,
  Transaction,
  define,
  useMvc,
  useBtc,
  mvcConnect,
  btcConnect,
  LocalWallet,
  MetaletWalletForMvc,
  MetaletWalletForBtc,
}
export type { EntitySchema, IMetaletWalletForBtc, IBtcConnector, IBtcEntity, CreateOptions }
