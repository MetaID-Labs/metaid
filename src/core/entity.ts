import { TxComposer, mvc } from "meta-contract";

import {
  getBiggestUtxo,
  getBuzzes,
  getRootNode,
  notify,
  getNewBrfcNodeInfo,
  getAccountInfo,
  UserAllInfo,
  getMetaidInitFee,
} from "@/api.js";
import { connected } from "@/decorators/connected.js";
import {
  buildOpreturn,
  buildBrfcRootOpreturn,
  buildMetaidRootOpreturn,
} from "@/utils/opreturn-builder.ts";
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
  path?: string;
};

export class Entity {
  public connector: Connector | undefined;
  private _name: string;
  private _schema: any;
  private _root: Root;
  public userInfo: UserAllInfo;
  constructor(name: string, schema: any) {
    this._name = name;
    this._schema = schema;
    //this.connector.entity = this;
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
  public async getMetaidBaseRoot(body?: {
    name: string;
  }): Promise<UserAllInfo> {
    let metaidBaseNodeInfo: Partial<UserAllInfo> = {
      metaId: "",
      protocolTxId: "",
      infoTxId: "",
      name: "",
    };
    try {
      if (this.metaid) {
        const accountInfo = await getAccountInfo(this.metaid);
        metaidBaseNodeInfo = accountInfo.data;
        if (
          metaidBaseNodeInfo.metaId &&
          metaidBaseNodeInfo.protocolTxId &&
          (metaidBaseNodeInfo.infoTxId && metaidBaseNodeInfo).name
        ) {
          this.userInfo = metaidBaseNodeInfo;
        }
      } else {
        const signature = await this.connector.signMessage(
          import.meta.env.VITE_SIGN_MSG
        );
        try {
          await getMetaidInitFee({
            address: this.address,
            xpub: this.connector.xpub,
            sigInfo: {
              xSignature: signature,
              xPublickey: await this.connector.getPublicKey("/0/0"),
            },
          });
        } catch (error) {
          console.log(error);
        }
      }
      if (
        !metaidBaseNodeInfo?.metaId ||
        !metaidBaseNodeInfo?.protocolTxId ||
        !metaidBaseNodeInfo?.infoTxId ||
        (!metaidBaseNodeInfo?.name && Array.isArray(this.schema))
      ) {
        let address, publicKey;
        for (let i of this.schema) {
          if (i.nodeName === "Root" && !metaidBaseNodeInfo.metaId) {
            publicKey = await this.connector.getPublicKey("/0/0");
            const { txid } = await this.createMetaidRoot(
              {
                publicKey,
              },
              i.nodeName
            );
            metaidBaseNodeInfo.metaId = txid;
          }
          if (i.nodeName === "Protocols" && !metaidBaseNodeInfo.protocolTxId) {
            publicKey = await this.connector.getPublicKey("/0/2");
            const { txid } = await this.createMetaidRoot(
              {
                publicKey,
                txid: metaidBaseNodeInfo.metaId,
              },
              i.nodeName
            );
            metaidBaseNodeInfo.protocolTxId = txid;
          }
          if (i.nodeName === "Info" && !metaidBaseNodeInfo.infoTxId) {
            publicKey = await this.connector.getPublicKey("/0/1");
            const { txid } = await this.createMetaidRoot(
              {
                publicKey,
                txid: metaidBaseNodeInfo.metaId,
              },
              i.nodeName
            );
            metaidBaseNodeInfo.infoTxId = txid;
          }
          if (i.nodeName === "name" && !metaidBaseNodeInfo.name) {
            address = await this.connector.getAddress("/0/1");
            publicKey = await this.connector.getPublicKey("/0/1");
            await this.createMetaidRoot(
              {
                address,
                publicKey,
                txid: metaidBaseNodeInfo.infoTxId,
                body: body.name ? body.name : import.meta.env.VITE_DefaultName,
              },
              i.nodeName
            );
            metaidBaseNodeInfo.name = body.name;
          }
          this.userInfo = metaidBaseNodeInfo;
          console.log("register metaid", this.userInfo);
        }
      }
      return this.userInfo;
    } catch (error) {
      throw new Error(error);
    }
  }

  @connected
  public async getRoot(): Promise<Partial<Root>> {
    if (this._root) return this._root;
    console.log("this.metaid", this.metaid);

    const root = await getRootNode({
      metaid: this.metaid,
      nodeName: this.schema.nodeName,
      nodeId: this.schema.versions[0].id,
    });
    this._root = root;
    let metaidInfo;

    if (!this._root) {
      metaidInfo = await getAccountInfo(this.metaid);

      if (metaidInfo.metaId) {
        const address = await this.connector.getAddress("/0/2");
        const newBrfcNode = await getNewBrfcNodeInfo({
          xpub: this.connector.xpub,
          parentTxId: metaidInfo.protocolTxId,
        });
        console.log("newBrfcNode123", newBrfcNode);
        const { txid } = await this.createRootNode({
          address,
          txid: metaidInfo.protocolTxId,
          // path: newBrfcNode.path,
          publicKey: newBrfcNode.publicKey,
        });

        return {
          address: newBrfcNode.address,
          txid,
          // path: newBrfcNode.path,
        };

        // return {
        //   address,
        //   txid:.createRootNodeTxId,
        // };
      }
    }

    return this._root;
  }

  @connected
  private async createRootNode(parent: {
    address: string;
    publicKey: string;
    txid?: string;
    body?: string;
  }) {
    const walletAddress = mvc.Address.fromString(
      this.connector.address,
      "mainnet" as any
    );
    // 1. send dust to root address
    const { txid: dustTxid } = await this.connector.send(
      parent.address,
      UTXO_DUST
    );
    const linkTxComposer = new TxComposer();
    linkTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(parent.address, "mainnet" as any),
      txId: dustTxid,
      outputIndex: 0,
      satoshis: UTXO_DUST,
    });

    const metaidOpreturn = buildBrfcRootOpreturn({
      publicKey: parent.publicKey,
      parentTxid: parent?.txid,
      protocolName: this.schema.nodeName,
      body: undefined,
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
    this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 0,
      // path: parent.path, //"/0/0",
    });

    this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 1,
      // path: "/0/0",
    });
    const txid = await this.connector.broadcast(linkTxComposer);
    console.log("txid", txid);
    await notify({ txHex: linkTxComposer.getRawHex() });

    return txid;
  }

  @connected
  private async createMetaidRoot(
    parent: Partial<{
      address: string;
      publicKey: string;
      txid: string;
      body: string;
    }>,
    nodeName: string
  ) {
    const walletAddress = mvc.Address.fromString(
      this.connector.address,
      "mainnet" as any
    );
    // 1. send dust to root address
    const linkTxComposer = new TxComposer();
    if (parent?.address) {
      const { txid: dustTxid } = await this.connector.send(
        parent.address,
        UTXO_DUST
      );
      linkTxComposer.appendP2PKHInput({
        address: mvc.Address.fromString(parent.address, "mainnet" as any),
        txId: dustTxid,
        outputIndex: 0,
        satoshis: UTXO_DUST,
      });
    }

    const metaidOpreturn = buildMetaidRootOpreturn({
      publicKey: parent.publicKey,
      parentTxid: parent?.txid,
      protocolName: nodeName,
      body: parent.body ? parent.body : "NULL",
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
    this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 0,
      // path: parent.path, //"/0/0",
    });
    if (parent?.address) {
      this.connector.signInput({
        txComposer: linkTxComposer,
        inputIndex: 1,
        // path: "/0/0",
      });
    }

    const txid = await this.connector.broadcast(linkTxComposer);
    console.log("txid", txid);
    await notify({ txHex: linkTxComposer.getRawHex() });

    return txid;
  }

  // @connected
  // private getPathByAddress(address: string) {
  //   let i = 0;
  //   let path;
  //   while (i < 1000) {
  //     const pathAddress = this.connector.getAddress(`/0/${i}`);
  //     if (pathAddress == address) {
  //       path = `/0/${i}`;
  //       break;
  //     }
  //     i++;
  //   }
  //   if (!path) {
  //     throw new Error(`path not found:${address}`);
  //   }
  //   return path;
  // }

  @connected
  public async create(body: unknown) {
    const root = await this.getRoot();
    console.log("root132456", root);

    // if (!root.path) {
    //   root.path = this.getPathByAddress(root.address);
    // }
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

    let linkTxComposer = new TxComposer();
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

    const input1Output = linkTxComposer.getInput(1).output;

    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 0,
    });
    linkTxComposer.getInput(1).output = input1Output;
    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 1,
    });
    await this.connector.broadcast(linkTxComposer);
    await notify({ txHex: linkTxComposer.getRawHex() });
    return true;
  }

  @connected
  public async createRoot() {
    const walletAddress = mvc.Address.fromString(
      this.connector.address,
      "mainnet" as any
    );

    const randomPriv = new mvc.PrivateKey(undefined, "mainnet");
    const randomPub = randomPriv.toPublicKey();

    const rootTxComposer = new TxComposer();
    // rootTxComposer.appendP2PKHInput({
    //   address: walletAddress,
    //   // txId: '00000
    // })
  }

  public async list() {
    if (this.name !== "buzz") throw new Error(errors.NOT_SUPPORTED);

    const items = await getBuzzes({ metaid: this.metaid });

    return {
      items,
      limit: 50,
    };
  }
}
