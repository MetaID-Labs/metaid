const repostSchema = {
  name: 'repost',
  nodeName: 'SimpleRePost',
  versions: [
    {
      version: 1,
      id: '157cd804478e',
      body: [
        {
          name: 'createTime',
          type: 'number',
        },
        {
          name: 'rePostTx',
          type: 'string',
        },
        {
          name: 'rePostProtocol',
          type: 'string',
        },
        {
          name: 'rePostComment',
          type: 'string',
        },
      ],
    },
  ],
}

export default repostSchema
