import twilio from 'twilio';

let client: any = null;

const getTwilioClient = () => {
  if (client) return client;
  
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('[WhatsApp] Twilio credentials missing. Client not initialized.');
    return null;
  }
  
  client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  return client;
};

export const sendWhatsApp = async (phone: string, message: string) => {
  try {
    const twilioClient = getTwilioClient();
    if (!twilioClient) {
      console.warn('[WhatsApp] Skipping message: Twilio client not available.');
      return;
    }

    // 1. Better Normalization
    // Strip everything except digits
    let digits = phone.replace(/\D/g, ''); 
    
    // Remove leading zero if present (common in Indian local format)
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    let formattedPhone = '';
    
    if (digits.length === 10) {
      // Standard 10-digit Indian number
      formattedPhone = `+91${digits}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      // 12-digit number starting with 91
      formattedPhone = `+${digits}`;
    } else if (phone.startsWith('+')) {
      // Already has a plus, just strip non-digits after it
      formattedPhone = `+${digits}`;
    } else {
      // Fallback for anything else
      formattedPhone = `+${digits}`;
    }

    // 2. Final validation
    if (formattedPhone.length < 10) {
      console.error(`[WhatsApp] Aborting: Phone number too short after normalization: "${phone}" -> "${formattedPhone}"`);
      return;
    }

    const from = process.env.TWILIO_FROM_NUMBER || 'whatsapp:+14155238886';
    
    console.log(`[WhatsApp] Attempting send: From=${from} To=whatsapp:${formattedPhone}`);

    const response = await twilioClient.messages.create({
      from,
      to: `whatsapp:${formattedPhone}`,
      body: message
    });

    console.log(`[WhatsApp] Success! SID: ${response.sid}, Status: ${response.status}`);
  } catch (error: any) {
    console.error(`[WhatsApp] Twilio ERROR [${error.code || 'NO_CODE'}]: ${error.message}`);
    if (error.moreInfo) {
      console.error(`[WhatsApp] More Info: ${error.moreInfo}`);
    }
  }
};

// Internal check for debug purposes
const paramsCheck = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('[WhatsApp] Environment variables TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN are missing.');
  }
};
