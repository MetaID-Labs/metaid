import { TxComposer, mvc, Wallet } from 'meta-contract'
import { IWallet, IWalletStatic, staticImplements } from './wallet.js'
import { getMetaId } from '@/api.js'

@staticImplements<IWalletStatic>()
export class LocalWallet implements IWallet {
  private mnemonic: string
  private derivePath: string
  private internal: Wallet | undefined
  public metaid: string | undefined
  public address: string | undefined

  private constructor(mnemonic: string, derivePath: string = `m/44'/236'/0'/0/0`) {
    this.mnemonic = mnemonic
    this.derivePath = derivePath
  }

  public static async create(mnemonic: string, derivePath: string = `m/44'/236'/0'/0/0`) {
    // create a new wallet
    const wallet = new LocalWallet(mnemonic, derivePath)

    // derive metaid and address from mnemonic
    const privateKey = mvc.Mnemonic.fromString(mnemonic)
      .toHDPrivateKey(undefined, 'mainnet' as any)
      .deriveChild(derivePath).privateKey
    wallet.address = privateKey.publicKey.toAddress().toString()

    // ask api for metaid
    wallet.metaid = await getMetaId({
      address: wallet.address,
    })

    wallet.internal = new Wallet(privateKey.toWIF(), 'mainnet' as any, 1)

    return wallet
  }

  public hasMetaId() {
    return !!this.metaid
  }

  public hasAddress() {
    return !!this.address
  }

  public signP2pkh(txComposer: TxComposer, inputIndex: number) {
    // look at the input's address and find out if it can be derived from the mnemonic
    const input = txComposer.tx.inputs[inputIndex]
    const toSignAddress = input.output.script.toAddress().toString()
    const basePk = mvc.Mnemonic.fromString(this.mnemonic)
      .toHDPrivateKey(undefined, 'mainnet' as any)
      .deriveChild(`m/44'/236'/0'/0`)

    let deriver = 0
    let toUsePrivateKey: mvc.PrivateKey
    while (deriver < 100) {
      const childPk = basePk.deriveChild(deriver)
      const childAddress = childPk.publicKey.toAddress('mainnet' as any).toString()

      if (childAddress === toSignAddress) {
        toUsePrivateKey = childPk.privateKey
        break
      }

      deriver++
    }

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
