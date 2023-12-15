# MetaID

## What is this?

MetaID is an entity protocol based on Microvision Chain and MetaID DID protocol. Developers can use MetaID to create their own entity resource.

## What do you mean by `Entity`?

Entity is a concept in MetaID. It is a collection of resources. For example, an entity named `Buzz` can be used to create a collection of resources called `buzzes`. Each `buzz` resource has its own unique id, which is a transaction id on Microvision Chain.

## Why do we use such a concept?

We use this concept to make it easier for developers to create their own entity resources. Developers can use MetaID to create their own entity resources, and then use the entity resources to create their own applications.

Previously we used the concept of `Brfc Node` to create metadata and build Web3 applications. But this concept is too verbose， too low-level, and not easy to use. So we created another abstraction layer on top of it, which is the concept of `entity`.

We call this abstraction process `EMM` (Entity-Metadata Mapping), similar to the ORM (Object-Relational Mapping) concept in the database field. By doing this, we can create and utilize a more semantic and developer-friendly way to code.

## How to use?

The API examples listed below are still under development. Use with caution.

### Define entity with schema

Define your entity schema in `src/metaid-entities/*.entity.ts`.

```ts
// src/metaid-entities/buzz.entity.ts
const buzzEntitySchema: EntitySchema = {
  name: 'buzz',
  nodeName: 'SimpleMicroblog', // underlying brfc node name
  versions: [
    // schema versioning
    {
      version: 1,
      id: 'b17e9e277bd7', // brfc id
      body: [
        // entity-specific data schema
        {
          name: 'content',
          type: 'string',
        },
      ],
    },
  ],
}

export default buzzEntitySchema
```


### Connect to wallet 

```ts
import {  MetaletWallet, connect } from '@metaid/metaid'
const metaletWallet = new MetaletWallet()
// connect to wallet to have a baseconnector to use specific entities
const baseConnector = connect(localWallet)
 ```

 > Note: you can connect an empty object. At this point, you can only use entity to retrieve data from blockchain but cannot store d ata.
  

### Create MetaID
Once you've built the baseConnector, the possibilities of what you can do become more extensive. First of all, we can utilize the baseconnector to 
create a MetaID Account, the following code will use a connector which is connected to a Metalet wallet. Then it will check whether the Metalet account has build a MetaID account, if not , it will accept the userName parameter provided by the user to create a brand new MetaID account.

```ts
const handleCreateMetaid = async (userName: string) => {
  if (!!baseConnector && !baseConnector.isMetaidValid()) {
    try {
      await baseConnector.createMetaid({ name: userName });
    } catch (error) {
      console.log("error", error);
    }
  }
};
```

### Use entity to interact with blockchain

```ts
// create a buzz handler with use method
const	buzzHandler = await baseConnector.use("buzz");
// get buzz listh data
const { items } = await buzzHandler.list(page);
 

// create
const body = { content: "Hello World", attachments: [] }
const { txid } = await Buzz.create(body);
 
```

## Some more complex use cases


### Create a buzz with attachments
First, define a new file entity schema.
```ts
const fileSchema = {
  name: 'file',
  nodeName: 'MetaFile',
  encoding: 'binary',
  versions: [
    {
      version: '1.0.1',
      id: 'fcac10a5ed83',
      body: '',
    },
  ],
}
```
then we can generate txid based on this schema. It is worth noting that you need to transform binary image data to hex format with Buffer.from method.

```ts
let attachMetafileUri = [];
const fileHandler = await baseConnector.use("file");
for (const a of attachments) {
		const data = Buffer.from(a.data, "hex");
		const { transactions: txs } = await fileHandler.create(data, {
			dataType: a.fileType,
			signMessage: "upload file",
			serialAction: "combo",
			transactions: fileTransactions,
		});
		attachMetafileUri.push(
			"metafile://" + txs[txs.length - 1].txComposer.getTxId()
		);
		fileTransactions = txs;
}
body.attachments = attachMetafileUri;
```
As you can see, The create method also accepts an optional parameter.
When you need to send multiple entities data to the blockchain. Until the last create method, you need to set the value of the options.serialAction parameter to combo in the previous create method.The purpose of this action is to bundle multiple transactions, thus avoiding multiple pop-ups when signing the transaction with the Metalet wallet and achieving a better user experience.
```ts
public async create(
    body: unknown, /* The data structure type of the 'body' parameter varies depending on the different 'entitySchema' definitions you've made.*/
    options?: {
      invisible: boolean //whether data is encrypted or not
      signMessage: string // 
      dataType?: string  // for different on-chain data type
      encoding?: string
      serialAction?: 'combo' | 'finish'
      transactions?: Transaction[]
    }
  ) {
		...
}
```
Finally, we can create a buzz with three image attachments
```ts
await Buzz.create(body, {
				signMessage: "create buzz",
				serialAction: "finish",
				transactions: fileTransactions,
			});
```

 
### Give a like to a buzz

First we need a new Like entity, base on its metaprocol definition, we have the following like entity schema definition.
```ts
const likeSchema = {
	name: "like",
	nodeName: "PayLike",
	versions: [
		{
			version: 1,
			id: "2ae43eeb26d9",
			body: [
				{
					name: "likeTo",
					type: "string",
				},
				{
					name: "isLike",
					type: "string",
				},
			],
		},
	],
};
```
And then, based on a logged-in MetaID account, you can like any buzz by calling this likeHandler.create method.The corresponding code is quite simple.
```js
const res = await likeHandler.create(
  { likeTo: txid, isLike: "1" },
  { signMessage: "like buzz" }
);
```
 
---

## API Reference

### Wallet

Can have multiple wallet implementations as long as it implements the `Wallet` interface.

```ts
import { LocalWallet, MetaletWallet } from '@metaid/metaid'

// use static method `create` to create a wallet instance
LocalWallet.create(mnemonic: string): LocalWallet
MetaletWallet.create(): Promise<MetaletWallet>
````

### Connector

A connector is the bridge between your wallet and the entity.

```ts
import { connect } from '@metaid/metaid'

connect(wallet: Wallet): Promise<Connector>

// connector methods
connector.isConnected(): boolean
connector.disconnect(): void
connector.use(entityName: string): Entity
connector.isMetaidValid(): boolean
connector.createMetaid(): Promise<string>

```

### Entity

An entity is a controller class to operate on a specific resource.

```ts
connector.use(entityName: string): Entity
   
entity.hasRoot(): boolean
entity.createRoot(): Promise<string>

// Query
entity.list(query?: Query): Promise<Resource[]>
entity.myList(query?: Query): Promise<Resource[]>
entity.one(query: Query | string): Promise<Resource>
entity.first(query: Query | string): Promise<Resource>
entity.get(query: Query | string): Promise<Resource>

// Mutation
entity.create(data: Record<string, any>): Promise<Resource>
entity.update(id: string, data: Record<string, any>): Promise<Resource>
entity.delete(id: string): Promise<Resource>

```

### Resource

A resource is a data object that represents a specific entity.

`entity.list()` returns an array of resources.

`entity.one()` returns a single resource.

```ts
type Resource = {
  txid: string
  createdAt: timestamp
  body: Record<string, any>
  // We wrap the resource's owner info in a `user` object.
  user: {
    metaid: string
    name: string
    avatar: string
  }
}
```
