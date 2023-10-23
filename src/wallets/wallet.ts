import { TxComposer } from 'meta-contract'

export interface WalletStatic {
  create: ((mnemonic: string, derivePath?: string) => MetaIDConnectWallet) | (() => Promise<MetaIDConnectWallet>)
}

export interface MetaIDConnectWallet {
  address: string
  xpub: string

  hasAddress(): boolean

  getAddress(path?: string): string | Promise<string>
  getPublicKey(path?: string): string | Promise<string>

  signInput({
    txComposer,
    inputIndex,
  }: {
    txComposer: TxComposer
    inputIndex: number
  }): TxComposer | Promise<TxComposer>

  send(
    toAddress: string,
    amount: number
  ): Promise<{
    txid: string
  }>

  broadcast(txComposer: TxComposer): Promise<{ txid: string }>

  // encrypt(message: string, publicKey: string): Promise<string>;

  signMessage(message: string, encoding?: 'utf-8' | 'base64' | 'hex' | 'utf8'): Promise<string>
}
