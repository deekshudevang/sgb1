import dotenv from 'dotenv';
dotenv.config();
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkSid(sid: string) {
  try {
    console.log(`Checking status for SID: ${sid}...`);
    const message = await client.messages(sid).fetch();
    console.log('--- Message Details ---');
    console.log(`To: ${message.to}`);
    console.log(`From: ${message.from}`);
    console.log(`Status: ${message.status}`);
    console.log(`Error Code: ${message.errorCode || 'None'}`);
    console.log(`Error Message: ${message.errorMessage || 'None'}`);
    console.log(`Date Created: ${message.dateCreated}`);
    console.log(`Date Sent: ${message.dateSent || 'Not sent yet'}`);
    console.log('-----------------------');
    
    if (message.status === 'failed' || message.errorCode) {
      console.log('\n[DIAGNOSIS]: Message failed. Check error code at https://www.twilio.com/docs/api/errors');
    } else if (message.status === 'undelivered') {
      console.log('\n[DIAGNOSIS]: Message undelivered. This often means the recipient has not joined the sandbox or the number is invalid for WhatsApp.');
    }
  } catch (err: any) {
    console.error('Error fetching SID:', err.message);
  }
}

const targetSid = process.argv[2] || 'SM5c5555b6488f8aac84e28947ae9bc010';
checkSid(targetSid);
