import type { EntitySchema } from './entity.js'

const buzzSchema: EntitySchema = {
  name: 'buzz',
  nodeName: 'SimpleMicroblog',
  versions: [
    {
      version: 1,
      id: 'b17e9e277bd7',
      body: [
        {
          name: 'content',
          type: 'string',
        },
        {
          name: 'attachments',
          type: 'array',
        },
      ],
    },
  ],
}

export default buzzSchema
