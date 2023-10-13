import axios from 'axios'

type AggregationResponse = {
  code: number
  data: {
    total: number
    results: {
      items: any[]
    }
  }
}

type MetaidBaseResponse = {
  code: number
  msg: string
  time: number
  error: string
  result: any
}

export async function getMetaid({ address }: { address: string }): Promise<string | null> {
  const url = `https://api.show3.io/metaid-base/v1/meta/root/${address}`

  try {
    const data = await axios
      .get(url)
      .then((res) => res.data)
      .then((res: MetaidBaseResponse) => {
        if (res.code !== 200) throw new Error(`Error: ${res.code}`)

        return res.result.rootTxId
      })

    return data
  } catch (error) {
    console.error(error)
  }
}

export async function getRootNode({ metaid, nodeName, nodeId }: { metaid: string; nodeName: string; nodeId: string }) {
  const url = `https://api.show3.io/aggregation/v2/app/metaId/getProtocolBrfcNode/${metaid}/${nodeName}`
  try {
    const data = await axios
      .get(url)
      .then((res) => res.data)
      .then((res: AggregationResponse) => {
        if (res.code !== 0) throw new Error(`Error: ${res.code}`)

        const { total, results } = res.data

        if (total === 0) return null

        const root = results.items.find((item) => item.data === nodeId)

        if (!root) return null

        root.id = root.data
        root.txid = root.txId
        root.parentTxid = root.parentTxId
        root.createdAt = root.timestamp
        delete root.data
        delete root.txId
        delete root.parentTxId
        delete root.timestamp

        return root
      })

    return data
  } catch (error) {
    console.error(error)
  }
}

// withCount(['like'])  likeCount: 3
export async function getBuzzes({ metaid }: { metaid: string }) {
  const url = `https://api.show3.io/aggregation/v2/app/show/posts/buzz?metaId=${metaid}`
  try {
    const data = await axios
      .get(url)
      .then((res) => res.data)
      .then((res: AggregationResponse) => {
        if (res.code !== 0) throw new Error(`Error: ${res.code}`)

        const { total, results } = res.data

        const buzzes = results.items.map(
          (item: {
            txId: string
            metaId: string
            userName: string
            avatarImage: string
            timestamp: number
            content: string
            attachments: any[]
          }) => {
            // aggregate user info
            const user = {
              metaid: item.metaId,
              name: item.userName,
              avatar: item.avatarImage,
            }

            // aggregate body
            const body = {
              content: item.content,
              attachments: item.attachments,
            }

            const buzz = {
              txid: item.txId,
              createdAt: item.timestamp,
              user,
              body,
            }

            return buzz
          },
        )

        return buzzes
      })

    return data
  } catch (error) {
    console.error(error)
  }
}

export async function notify({ txHex }: { txHex: string }) {
  const url = 'https://api.show3.io/metaid-base/v1/meta/upload/raw'

  const notifyRes = await axios.post(url, {
    raw: txHex,
    type: 1,
  })
}

export async function getUtxos({ address }: { address: string }): Promise<
  {
    txid: string
    outIndex: number
    address: string
    value: number
  }[]
> {
  const url = `https://mainnet.mvcapi.com/address/${address}/utxo`

  try {
    const data = await axios.get(url).then((res) => res.data)

    return data
  } catch (error) {
    console.error(error)
  }
}
