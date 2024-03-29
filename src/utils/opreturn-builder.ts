import { BrfcRootName, ProtocolName } from '@/data/protocols.js'

type MetaidOpreturn = [
  'mvc', // chain flag
  string, // public key of node
  string, // `${parentChainFlag(optional)}:${parentTxid}`
  'metaid',
  string, // protocol name
  string | Buffer, // stringify json body
  '0' | '1', // isEncrypted
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
  '0' | '1', // isEncrypted
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
  '0' | '1', // isEncrypted
  string, // version
  string, // content type
  string, // charset
]

export function buildRootOpreturn({ publicKey, parentTxid, schema, body }) {
  const opreturn: RootOpreturn = [
    'mvc',
    publicKey,
    'mvc:' + parentTxid,
    'metaid',
    schema.nodeName,
    schema.versions[0].id,
    body,
    '0',
    String(schema.versions[0].version),
    'text/plain',
    'UTF-8',
  ]
  console.log({ opreturn })

  return opreturn
}

export function buildOpreturn({
  publicKey,
  parentTxid,
  protocolName,
  body,
  invisible,
  dataType = 'application/json',
  encoding = 'UTF-8',
}: {
  publicKey: string
  parentTxid: string
  protocolName: string
  body: any
  invisible?: boolean
  dataType?: string
  encoding?: string
}) {
  const opreturn: MetaidOpreturn = [
    'mvc',
    publicKey,
    'mvc:' + parentTxid,
    'metaid',
    protocolName + '-' + publicKey.slice(0, 11),
    body == 'NULL' ? undefined : Buffer.isBuffer(body) ? body : JSON.stringify(body),
    !!invisible ? '1' : '0', //
    '1.0.0',
    dataType,
    encoding,
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
    protocolName === 'Root' ? 'NULL' : 'UTF- 8',
  ]

  return opreturn
}
