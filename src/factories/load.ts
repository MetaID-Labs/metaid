import { Connector } from '@/core/connector.js'
import { Entity } from '@/core/entity.js'
import type { EntitySchema } from '@/metaid-entities/entity.js'

export async function load(entitySchema: EntitySchema, options?: { connector?: Connector }) {
  const entity = new Entity(entitySchema.name, entitySchema)

  if (options?.connector) {
    entity.connector = options.connector
  }

  return entity
}
