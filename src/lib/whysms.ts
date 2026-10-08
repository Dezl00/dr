export async function sendOtpSms(phone: string, code: string) {
  // Format phone number for Egypt (default) if it starts with 01
  let formattedPhone = phone.trim();
  if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
    formattedPhone = `2${formattedPhone}`; // e.g. 2010xxxxxxxx
  } else if (formattedPhone.startsWith('+20')) {
    formattedPhone = formattedPhone.substring(1); // remove +
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
    // Standard format for Bulk SMS APIs
    const response = await fetch('https://bulk.whysms.com/api/v3/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        sender_id: senderId,
        recipient: formattedPhone,
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
