import type { AxiosError, AxiosRequestConfig } from 'axios'
import { api } from '@/shared/api/client'

function normalizeGeneratedUrl(url: string | undefined): string | undefined {
  return url?.replace(/^\/api\/v1(?=\/|$)/, '')
}

export const orvalMutator = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  return api({
    ...config,
    ...options,
    url: normalizeGeneratedUrl(options?.url ?? config.url),
    headers: {
      ...config.headers,
      ...options?.headers,
    },
  }).then(({ data }) => data)
}

export type ErrorType<Error> = AxiosError<Error>
export type BodyType<BodyData> = BodyData
