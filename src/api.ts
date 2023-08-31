import axios from 'axios'

type MetaidResponse = {
  code: number
  data: {
    total: number
    results: {
      items: any[]
    }
  }
}

export async function getRootNode({ metaid, nodeName, nodeId }: { metaid: string; nodeName: string; nodeId: string }) {
  const url = `https://api.show3.io/aggregation/v2/app/metaId/getProtocolBrfcNode/${metaid}/${nodeName}`
  try {
    console.log({ url })
    const data = await axios
      .get(url)
      .then((res) => res.data)
      .then((res: MetaidResponse) => {
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
