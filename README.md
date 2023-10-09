# MetaID

## What is this?

MetaID is an entity protocol based on Microvision Chain and MetaID DID protocol. Developers can use MetaID to create their own entity resource.

## What do you mean by `Entity`?

Entity is a concept in MetaID. It is a collection of resources. For example, an entity named `Buzz` can be used to create a collection of resources called `buzzes`. Each `buzz` resource has its own unique id, which is a transaction id on Microvision Chain.

## Why do we use such a concept?

We use this concept to make it easier for developers to create their own entity resources. Developers can use MetaID to create their own entity resources, and then use the entity resources to create their own applications.

Previously we used the concept of `Brfc Node` to create metadata and build Web3 applications. But this concept is too verbose， too low-level, and not easy to use. So we created another abstraction layer on top of it, which is the concept of `entity`.

We call this abstraction process `EMM` (Entity-Metadata Mapping), similar to the ORM (Object-Relational Mapping) concept in the database field. By doing this, we can create and utilize amore semantic and developer-friendly way to code.

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

### Load entity, or create one on the fly

```ts
import { define, use } from '@metaid/metaid'

// `define` api returns a class represents what the entity is.
const MyFirstEntity = define('my-first-entity', {
  //...
})

// `use` api returns a class represents what the entity is. (using pre-defined entity)
const Buzz = use('buzz') // this will search for `buzz.entity.ts` in `src/metaid-entities` folder and use its schema.
const GroupMessage = use('group-message')
```

### Connect to wallet

```ts
import { LocalWallet, MetaletWallet, connect } from '@metaid/metaid'

// create a local wallet instance using mnemonic
const localWallet = new LocalWallet('abchereisyourmnenonicstring')
// or use metalet wallet
const metaletWallet = new MetaletWallet()

// connect to wallet and use specific entities
const Buzz = connect(localWallet).use('buzz')
const GroupMessage = connect(metaletWallet).use('group-message')
```

### Use entity

```ts
// list
const buzzes = Buzz.list()

// list filtered by query
const buzzes = Buzz.list({
  where: {
    title: 'Hello World',
  },
})

// my list
const myBuzzes = Buzz.myList()

// has root
const hasRoot: boolean = Buzz.hasRoot()

// create root
if (!hasRoot) {
  await Buzz.createRoot()
}

// get one buzz
const buzz = Buzz.one('0x1234567890') // txid
const buzz = Buzz.first('0x1234567890') // or use alias `first`
const buzz = Buzz.get('0x1234567890') // ...or `get`
const buzz = Buzz.one({
  // use sql-like query
  where: {
    title: 'Hello World',
  },
})

// create
const newBuzz = Buzz.create({
  title: 'Hello World',
  content: 'This is my first buzz',
})

// update
const updatedBuzz = Buzz.update(newBuzz.id, {
  title: 'Hello World Again',
  content: 'Here we go..',
})
// or update one existing resource
const oldBuzz = Buzz.get('0x1234567890')
const updatedBuzz = oldBuzz.update({ content: 'Good day, commander!' })

// delete
const deletedBuzz = Buzz.delete('0x1234567890')
// or delete one existing resource
oldBuzz.delete()
```

## Some more complex use cases

### Create a buzz with 3 photos

```ts
const Buzz = use('buzz')
const File = use('metafile')

// 1. create 3 metafile resources representing the photos
const photos = await File.create([
  {
    name: 'photo1.jpg',
    type: 'image/jpeg',
    content: 'base64 string',
  },
  {
    name: 'photo2.jpg',
    type: 'image/jpeg',
    content: 'base64 string',
  },
  {
    name: 'photo3.jpg',
    type: 'image/jpeg',
    content: 'base64 string',
  },
])

// 2. create a buzz resource with the photos.
// We use `with` api to create a resource with its related resources to represent a 1-to-many relationship.
const buzz = await Buzz.with(photos).create({ content: 'Have a nice day!' })
```

### Give a like to a group message

```ts
const GroupMessage = use('group-message')
const Like = use('like')

// 1. fetch the group message we're about to like
const theMessage = await GroupMessage.get('0x1234567890')

// 2. create a like resource.
// We use `belongsTo` api to create a resource with its related resource to represent a 1-to-1 relationship.
await Like.belongsTo(theMessage).create()
```

### Refer an NFT info in a buzz

```ts
const Reference = use('reference')

await Reference.belongsTo(nft).create({
  content: 'Have a look at my gorgeous NFT!',
})
```
