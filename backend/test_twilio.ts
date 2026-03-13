import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function run() {
  try {
    const response = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: 'whatsapp:+919876543210', // test number
      body: 'Test Message'
    });
    console.log('Success:', response.sid);
  } catch (err: any) {
    console.error('Error:', err.message, err.code, err.moreInfo);
  }
}

run();
