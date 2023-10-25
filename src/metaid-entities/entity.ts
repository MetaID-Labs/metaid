export type EntitySchema = {
  name: string
  nodeName: string
  versions: {
    version: number
    id: string
    body: any[]
  }[]
}
