import { UserInfo } from '@/types'
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
  status: number
  originalId: string
  isTransfered: boolean
  preview: string
  content: string
  pop: string
}

// export type UserInfo = {
//   number: number
//   rootTxId: string
//   name: string
//   nameId: string
//   address: string
//   avatar: string | null
//   avatarId: string
//   bio: string
//   bioId: string
//   soulbondToken: string
//   unconfirmed: string
//   isInit: boolean
// }

const BASE_METALET_TEST_URL = `https://www.metalet.space/wallet-api/v3`
// const BASE_METAID_TEST_URL = `https://man-test.metaid.io`
const BASE_METAID_TEST_URL = `https://man.somecode.link`

export async function fetchUtxos({
  address,
  network = 'regtest',
}: {
  address: string
  network: 'livenet' | 'testnet' | 'regtest'
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

export type Network = 'livenet' | 'testnet' | 'regtest'

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

export async function getPinDetailByPid({
  pid,
  network = 'regtest',
}: {
  pid: string
  network?: 'livenet' | 'testnet' | 'regtest'
}): Promise<Pin | null> {
  const url = `${BASE_METAID_TEST_URL}/api/pin/${pid}`

  try {
    const data = await axios.get(url).then((res) => res.data)

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}
export async function getRootPinByAddress({
  address,
  network = 'regtest',
}: {
  address: string
  network?: 'livenet' | 'testnet' | 'regtest'
}): Promise<Pin | null> {
  const url = `${BASE_METAID_TEST_URL}/api/address/pin/root/${address}`

  try {
    const data = await axios.get(url).then((res) => res.data)

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getAllPinByPath({
  page,
  limit,
  path,
}: {
  page: number
  limit: number
  path: string
}): Promise<{ total: number; currentPage: Pin[] } | null> {
  const url = `${BASE_METAID_TEST_URL}/api/getAllPinByPath?page=${page}&limit=${limit}&path=${path}`

  try {
    const data = await axios.get(url).then((res) => res.data)
    return { total: data.data.total, currentPage: data.data.list }
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getPinListByAddress({
  address,
}: {
  address: string
  network?: 'livenet' | 'testnet' | 'regtest'
}): Promise<Pin[] | null> {
  const url = `${BASE_METAID_TEST_URL}/api/address/pin/list/${address}`

  try {
    const data = await axios.get(url).then((res) => res.data)
    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function getInfoByAddress({
  address,
  network = 'regtest',
}: {
  address: string
  network?: 'livenet' | 'testnet' | 'regtest'
}): Promise<UserInfo | null> {
  const url = `${BASE_METAID_TEST_URL}/api/info/address/${address}`

  try {
    const data = await axios.get(url).then((res) => res.data)

    return data.data
  } catch (error) {
    console.error(error)
    return null
  }
}
