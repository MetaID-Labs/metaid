import { TxComposer, mvc } from "meta-contract";

import {
  getBiggestUtxo,
  getBuzzes,
  getRootNode,
  notify,
  getNewBrfcNodeInfo,
} from "@/api.js";
import { connected } from "@/decorators/connected.js";
import { buildOpreturn } from "@/utils/opreturn-builder.ts";
import { Connector } from "./connector.ts";
import { errors } from "@/data/errors.ts";
import { UTXO_DUST } from "@/data/constants.ts";

type Root = {
  id: string;
  nodeName: string;
  address: string;
  txid: string;
  publicKey: string;
  parentTxid: string;
  parentPublicKey: string;
  version: string;
  createdAt: number;
};

export class Entity {
  // public credential: Credential | undefined
  public connector: Connector | undefined;
  private _name: string;
  private _schema: any;
  private _root: Root;

  constructor(name: string, schema: any) {
    this._name = name;
    this._schema = schema;
  }

  get name() {
    return this._name;
  }

  get schema() {
    return this._schema;
  }

  public isConnected() {
    return this.connector?.isConnected() ?? false;
  }

  public disconnect() {
    this.connector?.disconnect();
  }

  get address() {
    return this.connector?.address;
  }

  get metaid() {
    return this.connector?.metaid;
  }

  get root() {
    return this._root;
  }

  @connected
  public async getRoot() {
    if (this._root) return this._root;

    this._root = await getRootNode({
      metaid: this.metaid,
      nodeName: this.schema.nodeName,
      nodeId: this.schema.versions[0].id,
    });
    if (!this._root) {
      // const parentAddress = this.connector?.wallet.getAddress("0/0/2");
      // await getNewBrfcNodeInfo({
      //   xpub: this.connector?.wallet.xpub,
      //   parentTxId: "",
      // });
    }
    return this._root;
  }

  @connected
  public async create(body: unknown) {
    const root = await this.getRoot();
    const walletAddress = mvc.Address.fromString(
      this.connector.address,
      "mainnet" as any
    );

    // 1. send dust to root address
    const { txid: dustTxid } = await this.connector.send(
      root.address,
      UTXO_DUST
    );

    // 2. link tx
    const randomPriv = new mvc.PrivateKey(undefined, "mainnet");
    const randomPub = randomPriv.toPublicKey();

    const linkTxComposer = new TxComposer();
    linkTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(root.address, "mainnet" as any),
      txId: dustTxid,
      outputIndex: 0,
      satoshis: UTXO_DUST,
    });

    const metaidOpreturn = buildOpreturn({
      publicKey: randomPub.toString(),
      parentTxid: root.txid,
      protocolName: this.schema.nodeName,
      body,
    });
    linkTxComposer.appendOpReturnOutput(metaidOpreturn);

    const biggestUtxo = await getBiggestUtxo({
      address: walletAddress.toString(),
    });
    linkTxComposer.appendP2PKHInput({
      address: walletAddress,
      txId: biggestUtxo.txid,
      outputIndex: biggestUtxo.outIndex,
      satoshis: biggestUtxo.value,
    });
    linkTxComposer.appendChangeOutput(walletAddress, 1);

    this.connector.signP2pkh(linkTxComposer, 0);
    this.connector.signP2pkh(linkTxComposer, 1);
    await this.connector.broadcast(linkTxComposer);

    await notify({ txHex: linkTxComposer.getRawHex() });

    return true;
  }

  public async list() {
    if (this.name !== "buzz") throw new Error(errors.NOT_SUPPORTED);
    console.log("here");

    const items = await getBuzzes({ metaid: this.metaid });

    return {
      items,
      limit: 50,
    };
  }
}
