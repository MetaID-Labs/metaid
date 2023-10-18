import { TxComposer, mvc, Wallet as InternalWallet } from 'meta-contract'

import type { MetaIDConnectWallet, WalletStatic } from './wallet.js'
import { DERIVE_MAX_DEPTH } from '@/data/constants.js'
import { staticImplements } from '@/utils/index.js'
import { errors } from '@/data/errors.js'

@staticImplements<WalletStatic>()
export class LocalWallet implements MetaIDConnectWallet {
  private mnemonic: string
  private derivePath: string
  private internal: InternalWallet | undefined
  public address: string | undefined
  public xpub: string | undefined

  private get basePath() {
    return this.derivePath.split('/').slice(0, -2).join('/')
  }

  private constructor(mnemonic: string, derivePath: string = `m/44'/10001'/0'/0/0`) {
    this.mnemonic = mnemonic
    this.derivePath = derivePath
  }

  public static create(mnemonic: string, derivePath: string = `m/44'/10001'/0'/0/0`): MetaIDConnectWallet {
    // create a new wallet
    const wallet = new LocalWallet(mnemonic, derivePath)

    // derive address from mnemonic
    const privateKey = mvc.Mnemonic.fromString(mnemonic)
      .toHDPrivateKey(undefined, 'mainnet' as any)
      .deriveChild(derivePath).privateKey

    // derive xpub from mnemonic from base path
    wallet.xpub = mvc.Mnemonic.fromString(mnemonic)
      .toHDPrivateKey(undefined, 'mainnet' as any)
      .deriveChild(wallet.basePath)
      .xpubkey.toString()
    wallet.address = privateKey.publicKey.toAddress().toString()
    wallet.internal = new InternalWallet(privateKey.toWIF(), 'mainnet' as any, 1)

    wallet.internal = new InternalWallet(privateKey.toWIF(), 'mainnet' as any, 1)

    return wallet
  }

  public getAddress(path?: string) {
    if (!path) return this.address

    const fullPath = this.basePath + path
    let basePk = mvc.Mnemonic.fromString(this.mnemonic)
      .toHDPrivateKey(undefined, 'mainnet' as any)
      .deriveChild(fullPath)

    return basePk.publicKey.toAddress('mainnet' as any).toString()
  }

  public getPublicKey(path: string = '/0/0') {
    const fullPath = this.basePath + path
    const basePk = mvc.Mnemonic.fromString(this.mnemonic)
      .toHDPrivateKey(undefined, 'mainnet' as any)
      .deriveChild(fullPath)

    return basePk.publicKey.toString()
  }

  public hasAddress() {
    return !!this.address
  }

  public signInput({ txComposer, inputIndex }: { txComposer: TxComposer; inputIndex: number }) {
    // look at the input's address and find out if it can be derived from the mnemonic
    const input = txComposer.tx.inputs[inputIndex]
    const toSignAddress = input.output.script.toAddress().toString()
    const basePk = mvc.Mnemonic.fromString(this.mnemonic)
      .toHDPrivateKey(undefined, 'mainnet' as any)
      .deriveChild(this.basePath)

    let deriver = 0
    let toUsePrivateKey: mvc.PrivateKey
    while (deriver < DERIVE_MAX_DEPTH) {
      const childPk = basePk.deriveChild(0).deriveChild(deriver)
      const childAddress = childPk.publicKey.toAddress('mainnet' as any).toString()

      if (childAddress === toSignAddress) {
        toUsePrivateKey = childPk.privateKey
        break
      }

      deriver++
    }
    if (!toUsePrivateKey) throw new Error(errors.CANNOT_DERIVE_PATH)
    // sign the input
    txComposer.unlockP2PKHInput(toUsePrivateKey, inputIndex)

    return txComposer
  }

  public async send(toAddress: string, amount: number): Promise<{ txid: string }> {
    const { txId: txid } = await this.internal.send(toAddress, amount)

    return { txid }
  }

  public async broadcast(txComposer: TxComposer): Promise<{ txid: string }> {
    const txid = await this.internal.api.broadcast(txComposer.getRawHex())

    return { txid }
  }
}
