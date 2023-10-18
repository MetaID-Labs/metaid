export enum ProtocolName {
  SimpleMicroblog = "SimpleMicroblog",
  SimpleGroupChat = "SimpleGroupChat",
  Name = "name",
}

export const BrfcRootName: {
  [key in ProtocolName]: {
    brfcId: string;
    path: string;
    version: string;
  };
} = {
  [ProtocolName.Name]: {
    brfcId: "--",
    path: "info",
    version: "1.0.0",
  },
  [ProtocolName.SimpleMicroblog]: {
    brfcId: "b17e9e277bd7",
    path: "/Protocols/SimpleMicroblog",
    version: "1.0.0",
  },
  [ProtocolName.SimpleGroupChat]: {
    brfcId: "96e2649ce8b6",
    path: "/Protocols/SimpleGroupChat",
    version: "1.0.2",
  },
};
