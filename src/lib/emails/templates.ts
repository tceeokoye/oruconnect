export const EmailTemplates = {
  VerificationCodeEmail: (name: string, code: string, role: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your OruConnect Account</title>
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .wrapper { width: 100%; padding: 40px 0; }
        .container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .content { padding: 48px 40px; color: #334155; line-height: 1.6; text-align: center; }
        .content p { margin: 0 0 20px; font-size: 16px; }
        .content strong { color: #0f172a; font-weight: 700; }
        .code-container { background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px dashed #cbd5e1; }
        .code { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #2563eb; font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; margin: 0; }
        .instructions { font-size: 14px; color: #64748b; margin-top: 12px; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; }
        .logo { width: 48px; height: 48px; border-radius: 12px; background: white; padding: 8px; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <div class="logo">
              <!-- Placeholder for an actual logo icon -->
              <span style="color: #2563eb; font-size: 24px; font-weight: bold;">OC</span>
            </div>
            <h1>Welcome to OruConnect</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            <p>You’re almost ready to start using OruConnect as a <strong>${role}</strong>. Please use the verification code below to activate your account and verify your email address.</p>
            
            <div class="code-container">
              <div class="code">${code}</div>
              <div class="instructions">Enter this 6-digit code on the verification page.</div>
            </div>
            
            <p style="font-size: 14px; color: #64748b;">This code will expire securely in 1 hour. If you did not request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} OruConnect Nigeria. All rights reserved.</p>
            <p>Building trust across Africa.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  
  WelcomeEmail: (name: string, role: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to OruConnect</title>
      <style>/* Insert identical styles to above */</style>
    </head>
    <body style="font-family: sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;">
      <!-- Quick simplified welcome for scaling -->
      <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; padding: 40px; text-align: center;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">Registration Complete! 🎉</h1>
        <p style="color: #3f3f46; font-size: 16px; line-height: 1.6;">Hi ${name}, your email is verified and your ${role} account is fully active. You can now login to your dashboard!</p>
      </div>
    </body>
    </html>
  `
};
