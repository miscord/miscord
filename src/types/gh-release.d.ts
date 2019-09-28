declare module 'gh-release' {
  interface BasicAuth {
    username: string
    password: string
  }

  interface TokenAuth {
    token: string
  }

  interface Options {
    tag_name?: string
    target_commitish?: string
    name?: string
    body?: string
    draft?: boolean
    prerelease?: boolean
    repo?: string
    owner?: string
    endpoint?: string
    assets?: string[]
    auth?: BasicAuth | TokenAuth
  }

  export default function release (options: Options, callback: (err: Error | undefined, result: any) => void): void
}
