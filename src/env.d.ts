/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_METAID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { TestContext } from 'vitest'
import Domain from './domain.ts'
declare module 'vitest' {
  export interface TestContext {
    Buzz?: Domain
    GM?: Domain
  }
}
