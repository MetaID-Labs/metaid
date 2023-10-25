import { BrfcRootName, ProtocolName } from '@/data/protocols.js'

type MetaidOpreturn = [
  'mvc', // chain flag
  string, // public key of node
  string, // `${parentChainFlag(optional)}:${parentTxid}`
  'metaid',
  string, // protocol name
  string, // stringify json body
  string, // isEncrypted
  string, // version
  string, // content type
  string, // charset
]

type RootOpreturn = [
  'mvc', // chain flag
  string, // public key of node
  string, // `${parentChainFlag(optional)}:${parentTxid}`
  'metaid',
  string, // protocol name
  string, //brfcid
  string, // stringify json body
  string, // isEncrypted
  string, // version
  string, // content type
  string, // charset
]

type UserOpreturn = [
  'mvc', // chain flag
  string, // public key of node
  string, // `${parentChainFlag(optional)}:${parentTxid}`
  'metaid',
  string, // protocol name
  string, // stringify json body
  string, // isEncrypted
  string, // version
  string, // content type
  string, // charset
]

export function buildRootOpreturn({ publicKey, parentTxid, protocolName, body }) {
  const opreturn: RootOpreturn = [
    'mvc',
    publicKey,
    'mvc:' + parentTxid,
    'metaid',
    protocolName,
    BrfcRootName[protocolName].brfcId,
    body,
    '0',
    BrfcRootName[protocolName].version,
    'text/plain',
    'UTF-8',
  ]

  return opreturn
}

export function buildOpreturn({
  publicKey,
  parentTxid,
  protocolName,
  body,
  options,
}: {
  publicKey: string
  parentTxid: string
  protocolName: string
  body: any
  options?: Partial<{
    encrypt: string
    version: string
    dataType: string
    encoding: 'UTF-8' | 'binary'
  }>
}) {
  const opreturn: MetaidOpreturn = [
    'mvc',
    publicKey,
    'mvc:' + parentTxid,
    'metaid',
    protocolName + '-' + publicKey.slice(0, 11),
    body == 'NULL' ? undefined : JSON.stringify(body),
    options?.encrypt ? options.encrypt : '0',
    options?.version ? options.version : '1.0.0',
    options?.dataType ? options.dataType : 'application/json',
    options?.encoding ? options.encoding : 'UTF-8',
  ]

  return opreturn
}

export function buildUserOpreturn({
  publicKey,
  parentTxid,
  protocolName,
  body,
}: {
  publicKey: string
  parentTxid: string
  protocolName: string
  body: any
}) {
  const opreturn: UserOpreturn = [
    'mvc',
    publicKey,
    parentTxid ? 'mvc:' + parentTxid : 'mvc:' + 'NULL',
    'metaid',
    protocolName,
    body === 'NULL' ? 'NULL' : body,
    '0',
    protocolName === 'Root' ? '1.0.1' : 'NULL',
    protocolName === 'Root' ? 'NULL' : 'text/plain',
    protocolName === 'Root' ? 'NULL' : 'UTF-8',
  ]

  return opreturn
}
