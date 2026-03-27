import nodemailer from "nodemailer";

const EMAIL_USER = process.env.GMAIL_USER || process.env.SMTP_USER || "";
const EMAIL_PASSWORD = process.env.GMAIL_PASS || process.env.SMTP_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || '"OruConnect" <no-reply@oruconnect.com>';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (params: EmailParams) => {
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      ...params,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
};

// Email Templates

export const emailTemplates = {
  /**
   * Welcome email for new users
   */
  welcome: (firstName: string, role: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; border-radius: 5px; text-decoration: none; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to OruConnect!</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Welcome to OruConnect, Africa's most trusted marketplace for verified services.</p>
          <p>Your ${role} account has been successfully created. You can now:</p>
          <ul>
            <li>${role === "provider" ? "Post your services and build your business" : "Find verified service providers"}</li>
            <li>Connect with verified professionals</li>
            <li>Make secure transactions with escrow protection</li>
            <li>Build your reputation and grow your business</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="btn">Go to Dashboard</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Email verification
   */
  verifyEmail: (firstName: string, verificationLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; border-radius: 5px; text-decoration: none; margin-top: 15px; }
        .code-box { background: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Thank you for signing up to OruConnect! Please verify your email address to complete your account setup.</p>
          <p>Click the link below to verify your email:</p>
          <a href="${verificationLink}" class="btn">Verify Email</a>
          <p>Or copy this verification link:</p>
          <div class="code-box">${verificationLink}</div>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't sign up for OruConnect, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Job request received
   */
  jobRequestReceived: (providerName: string, clientName: string, jobTitle: string, jobRequestLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; border-radius: 5px; text-decoration: none; margin-top: 15px; }
        .job-box { background: #f9f9f9; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Job Request</h1>
        </div>
        <div class="content">
          <p>Hi ${providerName},</p>
          <p>${clientName} has sent you a job request!</p>
          <div class="job-box">
            <strong>Job Title:</strong> ${jobTitle}
            <p>They're interested in your services and would like to discuss the details.</p>
          </div>
          <p>Review and respond to this request to potentially win the job.</p>
          <a href="${jobRequestLink}" class="btn">View Request</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Job request accepted
   */
  jobRequestAccepted: (clientName: string, providerName: string, jobTitle: string, dashboardLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .btn { display: inline-block; padding: 12px 30px; background: #28a745; color: white; border-radius: 5px; text-decoration: none; margin-top: 15px; }
        .alert { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Job Request Accepted!</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>Great news! ${providerName} has accepted your job request for "${jobTitle}".</p>
          <div class="alert">
            <strong>Next Steps:</strong>
            <p>Start communicating with your provider through our messaging system. Your funds are held securely in escrow until the job is completed.</p>
          </div>
          <a href="${dashboardLink}" class="btn">View Job Details</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Payment confirmation
   */
  paymentConfirmation: (clientName: string, amount: number, reference: string, jobTitle: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .receipt { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .receipt-row.total { font-weight: bold; font-size: 18px; border-top: 2px solid #667eea; padding-top: 15px; border-bottom: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Confirmed</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>Your payment has been received and confirmed. Your funds are now held securely in escrow.</p>
          <div class="receipt">
            <div class="receipt-row">
              <span>Job:</span>
              <strong>${jobTitle}</strong>
            </div>
            <div class="receipt-row">
              <span>Amount Paid:</span>
              <strong>₦${amount.toLocaleString()}</strong>
            </div>
            <div class="receipt-row">
              <span>Reference:</span>
              <strong>${reference}</strong>
            </div>
            <div class="receipt-row">
              <span>Payment Date:</span>
              <strong>${new Date().toLocaleDateString()}</strong>
            </div>
          </div>
          <p>The provider has been notified and will begin work. You can track progress and communicate through your dashboard.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Job completion notification
   */
  jobCompleted: (clientName: string, providerName: string, jobTitle: string, reviewLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; border-radius: 5px; text-decoration: none; margin-top: 15px; }
        .alert { background: #cfe2ff; border: 1px solid #b6d4fe; color: #084298; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Job Completed!</h1>
        </div>
        <div class="content">
          <p>Hi ${clientName},</p>
          <p>${providerName} has marked the job "${jobTitle}" as complete!</p>
          <div class="alert">
            <strong>Next Steps:</strong>
            <p>Review the work. If you're satisfied, click "Mark Certified" to release payment to the provider. If there are issues, you can open a dispute.</p>
          </div>
          <a href="${reviewLink}" class="btn">Review & Certify</a>
          <p>Have questions? Our support team is here to help.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Payment released to provider
   */
  paymentReleased: (providerName: string, amount: number, platformFee: number) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .receipt { background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        .receipt-row.total { font-weight: bold; font-size: 18px; color: #28a745; border-top: 2px solid #28a745; padding-top: 15px; border-bottom: none; }
        .btn { display: inline-block; padding: 12px 30px; background: #28a745; color: white; border-radius: 5px; text-decoration: none; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Released!</h1>
        </div>
        <div class="content">
          <p>Hi ${providerName},</p>
          <p>Congratulations! The client has certified the completed job and your payment has been released.</p>
          <div class="receipt">
            <div class="receipt-row">
              <span>Total Amount:</span>
              <strong>₦${amount.toLocaleString()}</strong>
            </div>
            <div class="receipt-row">
              <span>Platform Fee (6%):</span>
              <strong>- ₦${platformFee.toLocaleString()}</strong>
            </div>
            <div class="receipt-row total">
              <span>Amount to Your Wallet:</span>
              <strong>₦${(amount - platformFee).toLocaleString()}</strong>
            </div>
          </div>
          <p>The funds have been added to your wallet. You can withdraw to your bank account anytime.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/wallet" class="btn">View Wallet</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Dispute notification
   */
  disputeCreated: (recipientName: string, disputeTitle: string, disputeLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc3545 0%, #ff6b6b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .btn { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; border-radius: 5px; text-decoration: none; margin-top: 15px; }
        .alert { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Dispute Notification</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p>A dispute has been opened regarding your job.</p>
          <div class="alert">
            <strong>Dispute:</strong> ${disputeTitle}
            <p>Our admin team will review all evidence and reach a fair resolution.</p>
          </div>
          <p>You can provide additional evidence or response to this dispute.</p>
          <a href="${disputeLink}" class="btn">View Dispute</a>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  /**
   * Dispute resolved
   */
  disputeResolved: (recipientName: string, resolution: string, details: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .resolution-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Dispute Resolved</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          <p>The dispute has been reviewed and resolved by our admin team.</p>
          <div class="resolution-box">
            <strong>Resolution:</strong> ${resolution}
            <p>${details}</p>
          </div>
          <p>If you have any concerns, please contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (email: string, firstName: string, role: string) => {
  return sendEmail({
    to: email,
    subject: `Welcome to OruConnect, ${firstName}!`,
    html: emailTemplates.welcome(firstName, role),
  });
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email: string, firstName: string, verificationLink: string) => {
  return sendEmail({
    to: email,
    subject: "Verify Your Email - OruConnect",
    html: emailTemplates.verifyEmail(firstName, verificationLink),
  });
};

/**
 * Send job request notification
 */
export const sendJobRequestEmail = async (
  providerEmail: string,
  providerName: string,
  clientName: string,
  jobTitle: string,
  jobRequestLink: string
) => {
  return sendEmail({
    to: providerEmail,
    subject: `New Job Request from ${clientName}`,
    html: emailTemplates.jobRequestReceived(providerName, clientName, jobTitle, jobRequestLink),
  });
};

/**
 * Send job acceptance notification
 */
export const sendJobAcceptanceEmail = async (
  clientEmail: string,
  clientName: string,
  providerName: string,
  jobTitle: string,
  dashboardLink: string
) => {
  return sendEmail({
    to: clientEmail,
    subject: `${providerName} Accepted Your Job Request!`,
    html: emailTemplates.jobRequestAccepted(clientName, providerName, jobTitle, dashboardLink),
  });
};

/**
 * Send payment confirmation
 */
export const sendPaymentConfirmationEmail = async (
  clientEmail: string,
  clientName: string,
  amount: number,
  reference: string,
  jobTitle: string
) => {
  return sendEmail({
    to: clientEmail,
    subject: "Payment Confirmed - OruConnect",
    html: emailTemplates.paymentConfirmation(clientName, amount, reference, jobTitle),
  });
};

/**
 * Send job completion notification
 */
export const sendJobCompletionEmail = async (
  clientEmail: string,
  clientName: string,
  providerName: string,
  jobTitle: string,
  reviewLink: string
) => {
  return sendEmail({
    to: clientEmail,
    subject: `${providerName} Completed "${jobTitle}"`,
    html: emailTemplates.jobCompleted(clientName, providerName, jobTitle, reviewLink),
  });
};

/**
 * Send payment release notification to provider
 */
export const sendPaymentReleaseEmail = async (
  providerEmail: string,
  providerName: string,
  amount: number,
  platformFee: number
) => {
  return sendEmail({
    to: providerEmail,
    subject: "Payment Released - OruConnect",
    html: emailTemplates.paymentReleased(providerName, amount, platformFee),
  });
};

/**
 * Send dispute notification
 */
export const sendDisputeNotificationEmail = async (
  recipientEmail: string,
  recipientName: string,
  disputeTitle: string,
  disputeLink: string
) => {
  return sendEmail({
    to: recipientEmail,
    subject: "Dispute Notification - OruConnect",
    html: emailTemplates.disputeCreated(recipientName, disputeTitle, disputeLink),
  });
};

/**
 * Send dispute resolution email
 */
export const sendDisputeResolutionEmail = async (
  recipientEmail: string,
  recipientName: string,
  resolution: string,
  details: string
) => {
  return sendEmail({
    to: recipientEmail,
    subject: "Dispute Resolved - OruConnect",
    html: emailTemplates.disputeResolved(recipientName, resolution, details),
  });
};

/**
 * Send OTP for login
 */
export const sendOTPEmail = async (email: string, otp: string, firstName: string) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .otp-box { background: #f0f4ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
        .warning { color: #ff6b6b; font-size: 12px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Login Verification</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Your one-time password (OTP) for logging into OruConnect is:</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <p class="warning">This code will expire in 10 minutes. Do not share this code with anyone.</p>
          </div>
          <p>If you didn't request this code, please ignore this email or contact our support team immediately.</p>
          <p>
            <strong>Security Reminder:</strong> OruConnect staff will never ask for your OTP code. Be cautious of phishing attempts.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: "Your OruConnect Login Code: " + otp,
    html,
  });
};

/**
 * Send 2FA setup email
 */
export const sendTwoFactorSetupEmail = async (
  email: string,
  firstName: string,
  method: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .security-box { background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Two-Factor Authentication Setup</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>You're setting up ${method === "email" ? "email-based" : "authenticator app-based"} two-factor authentication for your account.</p>
          
          <div class="security-box">
            <strong>Why 2FA?</strong>
            <p>Two-factor authentication adds an extra layer of security to your OruConnect account. Even if someone has your password, they won't be able to access your account without the second authentication factor.</p>
          </div>

          ${
            method === "email"
              ? `<p>You'll receive verification codes via email when you log in. Make sure to keep your email secure.</p>`
              : `<p>You'll use an authenticator app (like Google Authenticator or Authy) to generate codes. Store your backup codes in a safe place.</p>`
          }

          <p>If you did not initiate this request, please contact our support team immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: "Two-Factor Authentication Setup - OruConnect",
    html,
  });
};

/**
 * Send 2FA verification code
 */
export const sendTwoFactorCodeEmail = async (
  email: string,
  firstName: string,
  code: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; border: 1px solid #ddd; border-top: none; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none; }
        .code-box { background: #f0f4ff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #667eea; }
        .code { font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #667eea; }
        .warning { color: #ff6b6b; font-size: 12px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Two-Factor Authentication Code</h1>
        </div>
        <div class="content">
          <p>Hi ${firstName},</p>
          <p>Your two-factor authentication code is:</p>
          <div class="code-box">
            <div class="code">${code}</div>
            <p class="warning">This code will expire in 10 minutes.</p>
          </div>
          <p>If you didn't request this code, please ignore this email or contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2026 OruConnect. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: email,
    subject: "Your 2FA Code: " + code,
    html,
  });
};
