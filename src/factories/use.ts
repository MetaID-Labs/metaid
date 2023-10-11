import { Connector } from '@/connector.ts'
import { Entity } from '@/entity.ts'

export async function use(entitySymbol: string, options?: { connector?: Connector }) {
  const entitySchema = await import(`../metaid-entities/${entitySymbol}.entity.ts`).then((module) => module.default)

  const entity = new Entity(entitySchema.name, entitySchema)

  if (options?.connector) {
    entity.connector = options.connector
  }

  return entity
}
