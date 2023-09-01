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
export default function buildOpreturn({
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
    'meta:' + parentTxid,
    'metaid',
    [protocolName, publicKey.slice(0, 11)].join('-'),
    JSON.stringify(body),
    '0',
    '1.0.0',
    'application/json',
    'UTF-8',
  ]

  return opreturn
}
