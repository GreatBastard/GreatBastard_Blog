interface TwikooClient {
  init(options: Record<string, unknown>): Promise<unknown>
  getCommentsCount(options: Record<string, unknown>): Promise<Array<{ count: number }>>
}

interface Window {
  twikoo?: TwikooClient
}

declare var twikoo: TwikooClient | undefined
