/*
  Simple E2E test script (dev-friendly).
  - Uses environment variables: TEST_USER_EMAIL, TEST_USER_PASSWORD (if needed)
  - In development, /api/auth/send-otp returns _testOTP when NODE_ENV=development

  Run: node scripts/e2e/test-e2e.js
*/

const axios = require('axios');

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';

async function pause(ms) { return new Promise(res => setTimeout(res, ms)); }

(async function run(){
  try{
    console.log('E2E: Sending OTP to', TEST_EMAIL);
    let res = await axios.post(`${BASE}/api/auth/send-otp`, { email: TEST_EMAIL, purpose: 'login' });
    console.log('send-otp response:', res.data);

    const otp = res.data._testOTP || (process.env.TEST_OTP || null);
    if (!otp) {
      console.warn('No test OTP available. If running in production, use a real email. Aborting.');
      return;
    }

    console.log('E2E: Verifying OTP:', otp);
    res = await axios.post(`${BASE}/api/auth/verify-otp`, { email: TEST_EMAIL, code: otp, purpose: 'login' });
    console.log('verify-otp response:', res.data);

    if (res.data.requires2FA || res.data.requiresSetup2FA) {
      console.log('2FA required for this user. Attempting to simulate 2FA flow...');

      // request 2FA setup or code (simulate email method)
      // For test, send OTP for 2fa_verification
      res = await axios.post(`${BASE}/api/auth/send-otp`, { email: TEST_EMAIL, purpose: '2fa_verification' });
      const code = res.data._testOTP || process.env.TEST_2FA_OTP;
      console.log('2FA send response:', res.data);
      if (!code) {
        console.warn('No 2FA OTP available. Aborting 2FA test.');
      } else {
        res = await axios.post(`${BASE}/api/auth/2fa/verify`, { code, method: 'email' });
        console.log('2FA verify response:', res.data);
      }
    }

    // Test notification register token (dev only)
    console.log('Registering test device token (dev)');
    res = await axios.post(`${BASE}/api/notifications/register-token`, { token: 'test_token_123', platform: 'web' }, { headers: { 'Content-Type': 'application/json' } });
    console.log('register-token response:', res.data);

    // Create a test notification (dev-only endpoint)
    console.log('Creating test notification');
    res = await axios.post(`${BASE}/api/notifications/create`, { userId: res.data.data.userId || res.data.data.userId || null, type: 'system', title: 'E2E Test', message: 'This is a test notification from E2E script' });
    console.log('create notification response:', res.data);

    console.log('E2E script complete');
  }catch(err){
    console.error('E2E error', err.response ? err.response.data : err.message);
  }
})();
