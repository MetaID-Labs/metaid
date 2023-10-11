import { IWallet } from '@/wallets/wallet.ts'
import { Connector } from '@/connector.ts'

export function connect(wallet: IWallet) {
  return new Connector(wallet)
}
