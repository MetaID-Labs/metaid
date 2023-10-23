import { Connector } from '@/core/connector.js'
import { Entity } from '@/core/entity.js'

export async function use(entitySymbol: string, options?: { connector?: Connector }) {
  // 1
  // const path = `../metaid-entities/${entitySymbol}.entity.ts`
  // const entitySchema = await import(path).then((module) => module.default)

  // 2
  const entitySchema = await import(`../metaid-entities/${entitySymbol}.entity.ts`).then((module) => module.default)

  // // if symbol contains '/', it means it's a sub entity; use pure entity name
  // if (entitySymbol.includes('/')) {
  //   const splitted = entitySymbol.split('/')
  //   entitySymbol = splitted[splitted.length - 1]
  // }

  // // rename base entity to certain entity class
  // const entityClassName = entitySymbol[0].toUpperCase() + entitySymbol.slice(1)

  // // extends base entity class to use the entity's name as class.name

  const entity = new Entity(entitySchema.name, entitySchema)

  if (options?.connector) {
    entity.connector = options.connector
  }

  return entity
}
