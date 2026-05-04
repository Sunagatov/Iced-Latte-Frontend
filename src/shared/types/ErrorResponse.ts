export type ErrorResponse = {
  // RFC 9457 ProblemDetail fields
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  // Legacy / backward-compatible fields
  message?: string
  error?: string
  // Extensions
  timestamp?: string
  errors?: Array<{ field: string; message: string }>
}
