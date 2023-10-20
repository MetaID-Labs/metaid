import { BrfcRootName, ProtocolName } from '@/data/protocols.js'

type MetaidOpreturn = [
  'mvc', // chain flag
  string, // public key of node
  string, // `${parentChainFlag(optional)}:${parentTxid}`
  'metaid',
  string, // protocol name
  string, // stringify json body
  '0', // isEncrypted
  string, // version
  string, // content type
  string, // charset
]

type BrfcRootOpreturn = [
  'mvc', // chain flag
  string, // public key of node
  string, // `${parentChainFlag(optional)}:${parentTxid}`
  'metaid',
  string, // protocol name
  string, //brfcid
  string, // stringify json body
  '0', // isEncrypted
  string, // version
  string, // content type
  string, // charset
]

type MetaIDRootOpreturn = [
  'mvc', // chain flag
  string, // public key of node
  string, // `${parentChainFlag(optional)}:${parentTxid}`
  'metaid',
  string, // protocol name
  string, // stringify json body
  '0', // isEncrypted
  string, // version
  string, // content type
  string, // charset
]

export function buildBrfcRootOpreturn({ publicKey, parentTxid, protocolName, body }) {
  const opreturn: BrfcRootOpreturn = [
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
}: {
  publicKey: string
  parentTxid: string
  protocolName: string
  body: any
}) {
  const opreturn: MetaidOpreturn = [
    'mvc',
    publicKey,
    'mvc:' + parentTxid,
    'metaid',
    protocolName + '-' + publicKey.slice(0, 11),
    body == 'NULL' ? undefined : JSON.stringify(body),
    '0',
    '1.0.0',
    'application/json',
    'UTF-8',
  ]

  return opreturn
}

export function buildMetaidRootOpreturn({
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
  const opreturn: MetaIDRootOpreturn = [
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
