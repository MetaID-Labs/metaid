/* class decorator */
export function staticImplements<T>() {
  return <U extends T>(constructor: U) => {
    constructor
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
