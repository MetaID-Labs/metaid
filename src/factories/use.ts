import { Connector } from '@/core/connector.js'
import { Entity } from '@/core/entity.js'

export async function use(entitySymbol: string, options?: { connector?: Connector }) {
  const entitySchema = await import(`../metaid-entities/${entitySymbol}.entity.js`).then((module) => module.default)

  const entity = new Entity(entitySchema.name, entitySchema)

  if (options?.connector) {
    entity.connector = options.connector
  }

  return entity
}
