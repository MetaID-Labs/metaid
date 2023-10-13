import { TxComposer } from 'meta-contract'

export interface WalletStatic {
  create: ((mnemonic: string, derivePath?: string) => MetaIDConnectWallet) | (() => Promise<MetaIDConnectWallet>)
}

export interface MetaIDConnectWallet {
  address: string

  hasAddress(): boolean

  getAddress(path?: string): string
  getPublicKey(path?: string): string

  signP2pkh(txComposer: TxComposer, inputIndex: number): TxComposer
  send(
    toAddress: string,
    amount: number,
  ): Promise<{
    txid: string
  }>
  broadcast(txComposer: TxComposer): Promise<{ txid: string }>
}
