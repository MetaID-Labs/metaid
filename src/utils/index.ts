import Compressor from 'compressorjs'
import fs from 'node:fs'
// @ts-ignore
import CryptoJs from 'crypto-js'
// @ts-ignore
import encHex from 'crypto-js/enc-hex'
export enum IsEncrypt {
  Yes = 1,
  No = 0,
}

export type AttachmentItem = {
  fileName: string
  fileType: string
  data: string
  encrypt: IsEncrypt
  sha256: string
  size: number
  url: string
}

/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function FileToAttachment(file: File, encrypt: IsEncrypt = IsEncrypt.No) {
  return new Promise<AttachmentItem>(async (resolve, reject) => {
    function readResult(blob: Blob) {
      console.log('blob', blob)
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          // @ts-ignore
          const wordArray = CryptoJs.lib.WordArray.create(reader.result)
          // @ts-ignore
          const buffer = Buffer.from(reader.result)
          hex += buffer.toString('hex') // 更新hex
          // 增量更新计算结果
          sha256Algo.update(wordArray) // 更新hash
          resolve()
        }
        reader.readAsArrayBuffer(blob)
      })
    }
    // 分块读取，防止内存溢出，这里设置为20MB,可以根据实际情况进行配置
    const chunkSize = 20 * 1024 * 1024

    let hex = '' // 二进制
    const sha256Algo = CryptoJs.algo.SHA256.create()

    for (let index = 0; index < file.size; index += chunkSize) {
      await readResult(file.slice(index, index + chunkSize))
    }

    resolve({
      data: hex,
      fileName: file.name,
      fileType: file.type,
      sha256: encHex.stringify(sha256Algo.finalize()),
      url: URL.createObjectURL(file),
      encrypt,
      size: file.size,
    })
  })
}

export function createFileObject(filePath, fileName, mimeType) {
  const fileData = fs.readFileSync(filePath)
  const fileStats = fs.statSync(filePath)
  const file = {
    name: fileName,
    size: fileStats.size,
    type: mimeType || '',
    lastModified: fileStats.mtimeMs,
    arrayBuffer: async () => Buffer.from(fileData).buffer,
  }
  return file
}

export async function compressFile(files: File[], options?: any): Promise<AttachmentItem[]> {
  let useQuality = 0.6
  const attachments = []
  if (!files.length) {
    throw new Error('File List is empty')
  }
  outer: for (let file of files) {
    const compress = (quality: number): Promise<File> =>
      new Promise((resolve, reject) => {
        new Compressor(file, {
          quality,
          convertSize: 100_000, // 100KB
          success: resolve as () => File,
          error: reject,
        })
      })

    for (let i = 0; i < 5; i++) {
      try {
        const compressed = await compress(useQuality)
        if (compressed.size < 1_000_000) {
          const fileItem = await FileToAttachment(compressed)
          attachments.push(fileItem)
          continue
        }
        useQuality /= 2
      } catch (error) {
        break outer
      }
    }
  }

  return attachments
}
