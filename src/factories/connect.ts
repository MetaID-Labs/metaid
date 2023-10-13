import { IWallet } from '@/wallets/wallet.js'
import { Connector } from '@/core/connector.ts'

export function connect(wallet: IWallet) {
  return new Connector(wallet)
}
