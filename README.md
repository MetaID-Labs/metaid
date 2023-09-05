# Cooler MetaID

## What is this?

Cooler MetaID is a RESTful-like domain protocol based on Microvision Chain and MetaID DID protocol. Developers can use Cooler MetaID to create his own domain resource.

## How to use?

The API examples listed here are still under development.

### Define domain

```ts
import { define, use } from '@metaid/cooler-metaid'

// define api returns a class represents what the domain is.
const Buzz = define('buzz', {
  //...
})

// use api returns a class represents what the domain is. (using existing domain)
const Buzz = use('buzz')
const GroupMessage = use('group-message')
```

### Use domain

```ts
// list
const buzzes = Buzz.list()

// list filtered by query
const buzzes = Buzz.list({
  where: {
    title: 'Hello World',
  },
})

// auth
await Buzz.login('0x1234567890') // metaid or address
await Buzz.logout()

// my list
Buzz.login('0x1234567890') // metaid or address
const myBuzzes = Buzz.myList()

// has root
Buzz.login('0x1234567890') // metaid or address
const hasRoot: boolean = Buzz.hasRoot()

// create container
Buzz.login('0x1234567890') // metaid or address
await Buzz.hasRoot()

// get one
const buzz = Buzz.one('0x1234567890') // txid
const buzz = Buzz.first('0x1234567890') // or use alias `first`
const buzz = Buzz.get('0x1234567890') // ...or `get`
const buzz = Buzz.one({
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
const updatedBuzz = Buzz.update('0x1234567890', {
  title: 'Hello World',
  content: 'This is my first buzz',
})
// or update one existing resource
const oldBuzz = Buzz.get('0x1234567890')
const updatedBuzz = oldBuzz.update({
  title: 'Hello World',
  content: 'This is my first buzz',
})

// delete
const deletedBuzz = Buzz.delete('0x1234567890')
// or delete one existing resource
oldBuzz.delete()
```
