/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_METAID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import { TestContext } from 'vitest'
import { Entity } from './entity.ts'
declare module 'vitest' {
  export interface TestContext {
    Buzz?: Entity
    GM?: Entity
  }
}
