import { IWallet } from '@/wallets/wallet.js'
import { Connector } from '@/connector.js'

export function connect(wallet: IWallet) {
  return new Connector(wallet)
}
