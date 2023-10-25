export enum ProtocolName {
  SimpleMicroblog = 'SimpleMicroblog',
  SimpleGroupChat = 'SimpleGroupChat',
  SimpleRePost = 'SimpleRePost',
  PayLike = 'PayLike',
  Name = 'name',
}

export const BrfcRootName: {
  [key in ProtocolName]: {
    brfcId: string
    path: string
    version: string
  }
} = {
  [ProtocolName.Name]: {
    brfcId: '--',
    path: 'info',
    version: '1.0.0',
  },
  [ProtocolName.SimpleMicroblog]: {
    brfcId: 'b17e9e277bd7',
    path: '/Protocols/SimpleMicroblog',
    version: '1.0.0',
  },
  [ProtocolName.SimpleGroupChat]: {
    brfcId: '96e2649ce8b6',
    path: '/Protocols/SimpleGroupChat',
    version: '1.0.2',
  },
  [ProtocolName.PayLike]: {
    brfcId: '2ae43eeb26d9',
    path: '/Protocols/PayLike',
    version: '1.0.0',
  },
  [ProtocolName.SimpleRePost]: {
    brfcId: '157cd804478e',
    path: '/Protocols/SimpleRePost',
    version: '1.0.0',
  },
}
