const dotenv = require('dotenv');
const fs = require('fs');

const envConfig = dotenv.parse(fs.readFileSync('c:\\xampp\\htdocs\\drs\\.env'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

async function sendOtpSms(phone, code) {
  let formattedPhone = phone.trim();
  if (formattedPhone.startsWith('01') && formattedPhone.length === 11) {
    formattedPhone = `+20${formattedPhone.substring(1)}`;
  } else if (!formattedPhone.startsWith('+')) {
    formattedPhone = `+${formattedPhone}`;
  }

  const apiKey = process.env.WHYSMS_API_KEY;
  let senderId = process.env.WHYSMS_SENDER_ID || 'VERIFYX';
  if (senderId === 'WhySMS Test') senderId = 'VERIFYX';

  console.log('Sending to:', formattedPhone);
  console.log('API Key:', apiKey);

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
      message: `رمز التحقق الخاص بك لمنصة DRS هو: ${code}`,
    }),
  });
  
  if (!response.ok) {
     const errorText = await response.text();
     console.error('API HTTP Error:', errorText);
  } else {
     const data = await response.json();
     console.log('API Response:', data);
  }
}

sendOtpSms('01277009687', '123456');
