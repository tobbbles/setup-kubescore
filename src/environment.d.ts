declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PATH: string
    }
  }
}

export {}
