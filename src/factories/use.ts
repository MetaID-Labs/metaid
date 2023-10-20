import { Connector } from '@/core/connector.js'
import { Entity } from '@/core/entity.js'

export async function use(entitySymbol: string | string[], options?: { connector?: Connector }) {
  const path = Array.isArray(entitySymbol)
    ? `../metaid-entities/${entitySymbol.join('/')}.entity.ts`
    : `../metaid-entities/${entitySymbol}.entity.ts`
  const entitySchema = await import(path).then((module) => module.default)

  const entity = new Entity(Array.isArray(entitySchema) ? entitySchema[0].name : entitySchema.name, entitySchema)

  if (options?.connector) {
    entity.connector = options.connector
  }

  return entity
}
