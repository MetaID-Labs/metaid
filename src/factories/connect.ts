import type { MetaIDConnectWallet } from '@/wallets/wallet.js'
import { Connector } from '@/core/connector.js'

export async function connect(wallet?: MetaIDConnectWallet) {
  return await Connector.create(wallet)
}
