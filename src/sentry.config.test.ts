jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  replayIntegration: jest.fn(() => ({ name: 'Replay' })),
  captureRouterTransitionStart: jest.fn(),
}))

describe('Sentry 11 initialization', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      SENTRY_ENABLED: 'true',
      SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
      NEXT_PUBLIC_SENTRY_ENABLED: 'true',
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@example.ingest.sentry.io/1',
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  it.each([
    './sentry.client.config',
    './sentry.server.config',
    './sentry.edge.config',
  ])('keeps sensitive data collection disabled in %s', async (config) => {
    const sentry = await import('@sentry/nextjs')

    await import(config)

    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dataCollection: expect.objectContaining({
          userInfo: false,
          cookies: false,
          httpBodies: [],
          genAI: { inputs: false, outputs: false },
          databaseQueryData: false,
          queues: false,
          graphQL: { document: false, variables: false },
        }),
        beforeSend: expect.any(Function),
      }),
    )
  })
})
