export async function sendOtpSms(phone: string, code: string) {
  // Format phone number for Egypt (default)
  let formattedPhone = phone.trim();
  
  if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
    formattedPhone = `+20${formattedPhone.substring(1)}`; // e.g. +2010xxxxxxxx
  } else if (formattedPhone.startsWith('20') && formattedPhone.length === 12) {
    formattedPhone = `+${formattedPhone}`; // add + if missing
  } else if (!formattedPhone.startsWith('+')) {
    // If it doesn't have a country code, we can assume Egypt or just add +
    formattedPhone = `+${formattedPhone}`;
  }

  // WhySMS API configuration
  // Fallback to standard environment variables
  const apiKey = process.env.WHYSMS_API_KEY
  const senderId = process.env.WHYSMS_SENDER_ID || 'OTP'

  if (!apiKey) {
    console.warn('WHYSMS_API_KEY is not set. SMS sending skipped. OTP is:', code)
    // For development, we return success if no API key is present
    return { success: true, dummy: true }
  }

  const message = `رمز التحقق الخاص بك لمنصة DRS هو: ${code}`

  try {
    // Official WhySMS HTTP API Endpoint
    const response = await fetch('https://bulk.whysms.com/api/http/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        api_token: apiKey,
        recipient: formattedPhone,
        sender_id: senderId,
        type: 'otp',
        message: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WhySMS API Error:', errorText)
      return { success: false, error: 'Failed to send SMS via WhySMS' }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    console.error('WhySMS Network Error:', error)
    return { success: false, error: 'Network error connecting to WhySMS' }
  }
}

export async function sendSms(phone: string, message: string) {
  let formattedPhone = phone.trim()
  
  if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
    formattedPhone = `+20${formattedPhone.substring(1)}`
  } else if (formattedPhone.startsWith('20') && formattedPhone.length === 12) {
    formattedPhone = `+${formattedPhone}`
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+${formattedPhone}`
  }

  const apiKey = process.env.WHYSMS_API_KEY
  const senderId = process.env.WHYSMS_SENDER_ID || 'OTP'

  if (!apiKey) {
    console.warn('WHYSMS_API_KEY is not set. SMS sending skipped. Message:', message)
    return { success: true, dummy: true, error: 'API KEY MISSING IN ENV' }
  }

  try {
    const response = await fetch('https://bulk.whysms.com/api/http/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        api_token: apiKey,
        recipient: formattedPhone,
        sender_id: senderId,
        type: 'plain',
        message: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('WhySMS API Error:', errorText)
      return { success: false, error: `WhySMS Error: ${response.status} - ${errorText}` }
    }

    const data = await response.json()
    if (data.status === 'error') {
      return { success: false, error: `WhySMS API Error: ${data.message}` }
    }
    
    return { success: true, data }
  } catch (error: any) {
    console.error('WhySMS Network Error:', error)
    return { success: false, error: `Network Error: ${error.message}` }
  }
}
