import { MetaIDConnectWallet } from '@/wallets/wallet.js'
import { Connector } from '@/core/connector.ts'

export async function connect(wallet: MetaIDConnectWallet) {
  return await Connector.create(wallet)
}
