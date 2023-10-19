import { TxComposer, mvc } from 'meta-contract'

import { getUser, getMetaidInitFee,getBiggestUtxo, getBuzzes, getRootCandidate, getRootNode, getUtxos, notify, type User  } from '@/api.js'
import { connected } from '@/decorators/connected.js'
import { buildBrfcRootOpreturn, buildOpreturn ,buildMetaidRootOpreturn} from '@/utils/opreturn-builder.js'
import { Connector } from './connector.js'
import { errors } from '@/data/errors.js'
import { UTXO_DUST } from '@/data/constants.js'
import { sleep } from '@/utils/index.js'

type Root = {
  id: string
  nodeName: string
  address: string
  txid: string
  publicKey: string
  parentTxid: string
  parentPublicKey: string
  version: string
  createdAt: number
}

export class Entity {
  public connector: Connector | undefined;
  private _name: string;
  private _schema: any;
  private _root: Root;
  public userInfo: User;
  constructor(name: string, schema: any) {
    this._name = name;
    this._schema = schema;
    //this.connector.entity = this;
  }

  get name() {
    return this._name
  }

  get schema() {
    return this._schema
  }

  public isConnected() {
    return this.connector?.isConnected() ?? false
  }

  public disconnect() {
    this.connector?.disconnect()
  }

  get address() {
    return this.connector?.address
  }

  get metaid() {
    return this.connector?.metaid
  }

  get root() {
    return this._root
  }

  @connected
  public hasRoot() {
    return true
  }

  @connected
  public async getMetaidBaseRoot(body?: {
    name: string;
  }): Promise<User> {
    let metaidBaseNodeInfo: Partial<User> = {
      metaId: "",
      protocolTxId: "",
      infoTxId: "",
      name: "",
    };
    try {
      if (this.metaid) {
        const accountInfo = await getUser(this.metaid);
        metaidBaseNodeInfo = accountInfo;
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
    if (this._root) return this._root

    const root = await getRootNode({
      metaid: this.metaid,
      nodeName: this.schema.nodeName,
      nodeId: this.schema.versions[0].id,
    })
    this._root = root

    if (!this._root) {
      const user = await getUser(this.metaid)

      if (user.metaId) {
        const protocolAddress = await this.connector.getAddress('/0/2')
        const rootCandidate = await getRootCandidate({
          xpub: this.connector.xpub,
          parentTxId: user.protocolTxId,
        })

        const { txid } = await this.createRoot({
          protocolAddress,
          protocolTxid: user.protocolTxId,

          candidatePublicKey: rootCandidate.publicKey,
        })

        await sleep(1000)

        // re fetch
        const root = await getRootNode({
          metaid: this.metaid,
          nodeName: this.schema.nodeName,
          nodeId: this.schema.versions[0].id,
        })
        if (!root) throw new Error(errors.FAILED_TO_CREATE_ROOT)

        this._root = root
      }
    }

    return this._root
  }

  @connected
  private async createRoot({
    protocolAddress,
    protocolTxid,
    candidatePublicKey,
  }: {
    protocolAddress: string
    protocolTxid: string
    candidatePublicKey: string
  }) {
    const walletAddress = mvc.Address.fromString(this.connector.address, 'mainnet' as any)

    let dustTxid = ''
    let dustValue = 0
    // 1.1 first, check if protocol address already has dust utxos;
    // if so, use it directly;
    const dusts = await getUtxos({ address: protocolAddress })
    if (dusts.length > 0) {
      dustTxid = dusts[0].txid
      dustValue = dusts[0].value
    } else {
      // 1.2 otherwise, send dust to root address
      const { txid } = await this.connector.send(protocolAddress, UTXO_DUST)
      dustTxid = txid
      dustValue = UTXO_DUST
    }

    // 2. link tx
    let linkTxComposer = new TxComposer()
    linkTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(protocolAddress, 'mainnet' as any),
      txId: dustTxid,
      outputIndex: 0,
      satoshis: dustValue,
    })

    const metaidOpreturn = buildBrfcRootOpreturn({
      publicKey: candidatePublicKey,
      parentTxid: protocolTxid,
      protocolName: this.schema.nodeName,
      body: undefined,
    })
    linkTxComposer.appendOpReturnOutput(metaidOpreturn)

    const biggestUtxo = await getBiggestUtxo({
      address: walletAddress.toString(),
    })
    linkTxComposer.appendP2PKHInput({
      address: walletAddress,
      txId: biggestUtxo.txid,
      outputIndex: biggestUtxo.outIndex,
      satoshis: biggestUtxo.value,
    })
    linkTxComposer.appendChangeOutput(walletAddress, 1)

    // save input-1's output for later use
    const input1Output = linkTxComposer.getInput(1).output

    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 0,
    })

    // reassign input-1's output
    linkTxComposer.getInput(1).output = input1Output
    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 1,
    })
    const { txid } = await this.connector.broadcast(linkTxComposer)

    await notify({ txHex: linkTxComposer.getRawHex() })

    return { txid }
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
  public async create(
    body: unknown,
    options?: {
      invisible: boolean
    }
  ) {
    const root = await this.getRoot()
    const walletAddress = mvc.Address.fromString(this.connector.address, 'mainnet' as any)

    let dustTxid = ''
    let dustValue = 0
    // 1.1 first, check if root address already has dust utxos;
    // if so, use it directly;
    const dusts = await getUtxos({ address: root.address })
    if (dusts.length > 0) {
      dustTxid = dusts[0].txid
      dustValue = dusts[0].value
    } else {
      // 1.2 otherwise, send dust to root address
      const { txid } = await this.connector.send(root.address, UTXO_DUST)
      dustTxid = txid
      dustValue = UTXO_DUST
    }

    // 2. link tx
    const randomPriv = new mvc.PrivateKey(undefined, 'mainnet')
    const randomPub = randomPriv.toPublicKey()

    let linkTxComposer = new TxComposer()
    linkTxComposer.appendP2PKHInput({
      address: mvc.Address.fromString(root.address, 'mainnet' as any),
      txId: dustTxid,
      outputIndex: 0,
      satoshis: dustValue,
    })

    const metaidOpreturn = buildOpreturn({
      publicKey: randomPub.toString(),
      parentTxid: root.txid,
      protocolName: this.schema.nodeName,
      body,
    })
    linkTxComposer.appendOpReturnOutput(metaidOpreturn)

    const biggestUtxo = await getBiggestUtxo({ address: walletAddress.toString() })
    linkTxComposer.appendP2PKHInput({
      address: walletAddress,
      txId: biggestUtxo.txid,
      outputIndex: biggestUtxo.outIndex,
      satoshis: biggestUtxo.value,
    })
    linkTxComposer.appendChangeOutput(walletAddress, 1)

    // save input-1's output for later use
    const input1Output = linkTxComposer.getInput(1).output

    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 0,
    })

    // reassign input-1's output
    linkTxComposer.getInput(1).output = input1Output
    linkTxComposer = await this.connector.signInput({
      txComposer: linkTxComposer,
      inputIndex: 1,
    })
    const { txid } = await this.connector.broadcast(linkTxComposer)

    await notify({ txHex: linkTxComposer.getRawHex() })

    return { txid }
  }

  public async list() {
    if (this.name !== 'buzz') throw new Error(errors.NOT_SUPPORTED)

    const items = await getBuzzes({ metaid: this.metaid })

    return {
      items,
      limit: 50,
    }
  }
}
