import axios from 'axios'

export type Utxo = {
  confirmed: boolean
  inscriptions: string | null
  satoshi: number
  txId: string
  vout: number
}

export type Pin = {
  id: string
  number: number
  rootTxId: string
  address: string
  output: string
  outputValue: number
  timestamp: number
  genesisFee: number
  genesisHeight: number
  genesisTransaction: string
  txInIndex: number
  txInOffset: number
  operation: string
  path: string
  parentPath: string
  encryption: string
  version: string
  contentType: string
  contentBody: string
  contentLength: number
  contentSummary: string
}

const BASE_METALET_TEST_URL = `https://www.metalet.space/wallet-api/v3`
const BASE_METAID_TEST_URL = `http://man-test.metaid.io`

export async function fetchUtxos({
  address,
  network = 'testnet',
}: {
  address: string
  network: 'livenet' | 'testnet'
}): Promise<Utxo[]> {
  const url = `${BASE_METALET_TEST_URL}/address/btc-utxo?net=${network}&address=${address}
  `

  try {
    const data = await axios.get(url).then((res) => res.data)

    return data.data
  } catch (error) {
    console.error(error)
    return []
  }
}

export type Network = 'livenet' | 'testnet'

export async function broadcast({
  rawTx,
  publicKey,
  network,
  message,
}: {
  rawTx: string
  publicKey: string
  network: Network
  message: string
}): Promise<{ data: any; code: number; message: string }> {
  const url = `${BASE_METALET_TEST_URL}/tx/broadcast`
  const signature = await window.metaidwallet.btc.signMessage(message)

  try {
    const data = await axios.post(
      url,
      {
        chain: 'btc',
        net: network,
        rawTx: rawTx,
      },
      {
        headers: {
          'X-Signature': signature,
          'X-Public-Key': publicKey,
        },
      }
    )
    return data.data
  } catch (error) {
    console.log(error)
  }
}

export async function getRootPinByAddress({
  address,
  network = 'testnet',
}: {
  address: string
  network?: 'livenet' | 'testnet'
}): Promise<Pin | null> {
  const url = `${BASE_METAID_TEST_URL}/api/btc/address/pin/root/${address}`

  try {
    const data = await axios.get(url).then((res) => res.data)

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}
