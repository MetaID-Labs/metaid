const buzzSchema = {
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
          name: 'attachmentIds',
          type: 'array',
        },
      ],
    },
  ],
}

export default buzzSchema
