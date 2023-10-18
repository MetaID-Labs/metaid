import { TxComposer, mvc } from "meta-contract";

import {
	getBiggestUtxo,
	getBuzzes,
	getRootNode,
	notify,
	getNewBrfcNodeInfo,
	getAccountInfo,
} from "@/api.js";
import { connected } from "@/decorators/connected.js";
import { buildOpreturn, buildBrfcRootOpreturn } from "@/utils/opreturn-builder.ts";
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
	public async getRoot(): Promise<Partial<Root>> {
		if (this._root) return this._root;

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
					path: newBrfcNode.path,
					publicKey: newBrfcNode.publicKey,
				});

				return {
					address: newBrfcNode.address,
					txid,
					path: newBrfcNode.path,
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
		txid: string;
		path: string;
		publicKey: string;
	}) {
		const walletAddress = mvc.Address.fromString(this.connector.address, "mainnet" as any);
		// 1. send dust to root address
		const { txid: dustTxid } = await this.connector.send(parent.address, UTXO_DUST);
		const linkTxComposer = new TxComposer();
		linkTxComposer.appendP2PKHInput({
			address: mvc.Address.fromString(parent.address, "mainnet" as any),
			txId: dustTxid,
			outputIndex: 0,
			satoshis: UTXO_DUST,
		});

		const metaidOpreturn = buildBrfcRootOpreturn({
			publicKey: parent.publicKey,
			parentTxid: parent.txid,
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
		// console.log("root132456", root);
		if (!root) throw new Error(errors.NO_ROOT_DETECTED);

		// if (!root.path) {
		//   root.path = this.getPathByAddress(root.address);
		// }
		const walletAddress = mvc.Address.fromString(this.connector.address, "mainnet" as any);

		// 1. send dust to root address
		const { txid: dustTxid } = await this.connector.send(root.address, UTXO_DUST);

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
		const walletAddress = mvc.Address.fromString(this.connector.address, "mainnet" as any);

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
