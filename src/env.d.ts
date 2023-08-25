/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST_METAID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
