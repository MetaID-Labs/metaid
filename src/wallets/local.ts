import { IWallet } from './wallet.ts'

class LocalWallet implements IWallet {
  constructor() {
    console.log('LocalWallet')
  }
}
