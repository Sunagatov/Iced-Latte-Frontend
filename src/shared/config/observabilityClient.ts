export const CLIENT_OBSERVABILITY_ENABLED =
  process.env.NEXT_PUBLIC_OBSERVABILITY_ENABLED === 'true'

export const CLIENT_OBSERVABILITY_ENDPOINT = '/api/observability/events'

function parseSampleRate(value: string | undefined): number {
  if (!value) return 1

  const parsed = Number(value)

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 1
}

export const WEB_VITALS_SAMPLE_RATE = parseSampleRate(
  process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE,
)
