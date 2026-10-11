const whySmsEndpoint = 'https://bulk.whysms.com/api/http/sms/send'

type SmsType = 'otp' | 'plain' | 'unicode'

export type SmsResult =
  | { success: true; providerResponse: unknown }
  | { success: false; error: string }

/** Convert Egyptian local numbers and valid E.164 numbers to one canonical form. */
export function formatSmsPhone(phone: string): string | null {
  let value = phone.trim().replace(/[\s()-]/g, '')
  if (value.startsWith('00')) value = `+${value.slice(2)}`

  const digits = value.replace(/^\+/, '')
  if (/^01[0125]\d{8}$/.test(digits)) return `+20${digits.slice(1)}`
  if (/^201[0125]\d{8}$/.test(digits)) return `+${digits}`
  if (/^[1-9]\d{7,14}$/.test(digits)) return `+${digits}`
  return null
}

/** Forms accepted by existing records while new records use the E.164 form. */
export function phoneLookupVariants(phone: string): string[] {
  const raw = phone.trim()
  const compact = raw.replace(/[\s()-]/g, '')
  const canonical = formatSmsPhone(raw)
  const variants = new Set([raw, compact])

  if (canonical) {
    variants.add(canonical)
    variants.add(canonical.slice(1))
    if (canonical.startsWith('+20')) variants.add(`0${canonical.slice(3)}`)
  }

  return [...variants].filter(Boolean)
}

function readProviderError(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as Record<string, unknown>
  if (data.success === false || data.status === 'error' || data.status === false) {
    return typeof data.message === 'string' ? data.message : 'The SMS provider rejected the request'
  }
  return null
}

async function sendThroughWhySms(phone: string, message: string, type: SmsType): Promise<SmsResult> {
  const apiKey = process.env.WHYSMS_API_KEY
  const configuredSender = process.env.WHYSMS_SENDER_ID?.trim()
  const senderId = configuredSender && configuredSender !== 'WhySMS Test' ? configuredSender : 'VERIFYX'
  const recipient = formatSmsPhone(phone)

  if (!apiKey) return { success: false, error: 'SMS service is not configured' }
  if (!recipient) return { success: false, error: 'Invalid recipient phone number' }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const response = await fetch(whySmsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        api_token: apiKey,
        recipient,
        sender_id: senderId,
        type,
        message,
      }),
      signal: controller.signal,
    })

    const raw = await response.text()
    let payload: unknown = raw
    try {
      payload = raw ? JSON.parse(raw) : null
    } catch {
      // A non-JSON provider response is still validated by the HTTP status.
    }

    if (!response.ok || readProviderError(payload)) {
      console.error('WhySMS rejected a request', { status: response.status, type })
      return { success: false, error: 'SMS provider rejected the request' }
    }

    return { success: true, providerResponse: payload }
  } catch (error) {
    const reason = error instanceof Error && error.name === 'AbortError'
      ? 'SMS provider timed out'
      : 'Unable to reach SMS provider'
    console.error('WhySMS request failed', { reason, type })
    return { success: false, error: reason }
  } finally {
    clearTimeout(timeout)
  }
}

export async function sendOtpSms(phone: string, code: string): Promise<SmsResult> {
  if (!/^\d{6}$/.test(code)) return { success: false, error: 'Invalid OTP code' }
  return sendThroughWhySms(phone, `رمز التحقق الخاص بك لمنصة DRS هو: ${code}`, 'otp')
}

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  const type: SmsType = /[\u0600-\u06FF]/.test(message) ? 'unicode' : 'plain'
  const result = await sendThroughWhySms(phone, message, type)

  // VERIFYX accounts are commonly provisioned as OTP-only accounts. Retry once
  // with that channel without duplicating a successful transactional message.
  if (!result.success && (process.env.WHYSMS_SENDER_ID?.trim() || 'VERIFYX') === 'VERIFYX') {
    return sendThroughWhySms(phone, message, 'otp')
  }
  return result
}
