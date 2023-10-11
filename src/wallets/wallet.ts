import { TxComposer } from 'meta-contract'

/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor
  }
}

export interface IWalletStatic {
  create(mnemonic: string, derivePath?: string): Promise<IWallet>
}

export interface IWallet {
  metaid: string
  address: string

  hasAddress(): boolean
  hasMetaId(): boolean

  signP2pkh(txComposer: TxComposer, inputIndex: number): TxComposer
  send(
    toAddress: string,
    amount: number,
  ): Promise<{
    txid: string
  }>
  broadcast(txComposer: TxComposer): Promise<{ txid: string }>
}
