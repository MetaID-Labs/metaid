interface Window {
  metaidwallet: {
    getXPublicKey: () => Promise<string>
    connect: () => Promise<{ address: string; status?: string }>
    btc: {
      signPsbt: ({ psbtHex: string, options: any }) => Promise<string>
      signMessage: (msg: string) => Promise<string>
      connect: () => Promise<{ address: string; pubKey: string; status?: string }>
      getPublicKey: () => Promise<string>
      getAddress: () => Promise<string>
      getBalance: () => Promise<{ address: string; total: number; confirmed: number; unconfirmed: number }>
      inscribe: ({ data, options }: { data: any; options?: { noBroadcast: boolean } }) => Promise<any>
    }
  }
}
