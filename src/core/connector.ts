import { use } from "@/factories/use.js";
import { MetaIDConnectWallet } from "../wallets/wallet.ts";
import { TxComposer } from "meta-contract";
import { getMetaid } from "@/api.ts";

export class Connector {
  private _isConnected: boolean;
  private wallet: MetaIDConnectWallet;
  public metaid: string | undefined;
  public address: string | undefined;

  private constructor(wallet: MetaIDConnectWallet) {
    this._isConnected = true;

    this.wallet = wallet;
    this.address = wallet.address;
  }

  get xpub() {
    return this.wallet.xpub;
  }

  public static async create(wallet: MetaIDConnectWallet) {
    const connector = new Connector(wallet);
    console.log({ wallet });

    // ask api for metaid
    connector.metaid =
      (await getMetaid({
        address: wallet.address,
      })) || undefined;

    return connector;
  }

  // metaid
  hasMetaid() {
    return !!this.metaid;
  }

  use(entitySymbol: string) {
    return use(entitySymbol, { connector: this });
  }

  isConnected() {
    return this._isConnected;
  }

  disconnect() {
    this._isConnected = false;
  }

  /**
   * wallet delegation
   * signInput / send / broadcast
   */
  signInput({
    txComposer,
    inputIndex,
    path,
  }: {
    txComposer: TxComposer;
    inputIndex: number;
    path: string;
  }) {
    return this.wallet.signInput({ txComposer, inputIndex, path });
  }

  send(toAddress: string, amount: number) {
    return this.wallet.send(toAddress, amount);
  }

  broadcast(txComposer: TxComposer) {
    return this.wallet.broadcast(txComposer);
  }

  getPublicKey(path?: string) {
    return this.wallet.getPublicKey(path);
  }

  getAddress(path?: string) {
    return this.wallet.getAddress(path);
  }
}
