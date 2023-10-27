const fileSchema = {
  name: 'file',
  nodeName: 'MetaFile',
  versions: [
    {
      version: '1.0.1',
      id: 'fcac10a5ed83',
      body: [
        {
          name: 'node_name', // filename
          type: 'string',
        },
        {
          name: 'data', // binary data
          type: 'string',
        },
        {
          name: 'data_type', // 文件的格式类型
          type: 'string',
        },
      ],
    },
  ],
}

export default fileSchema
