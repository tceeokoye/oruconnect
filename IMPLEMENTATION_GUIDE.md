# OruConnect - Complete Implementation Guide

## Overview

OruConnect is a comprehensive Upwork-like marketplace platform built with Next.js 16, MongoDB, and integrated with Monify payment gateway. This document provides complete setup and usage instructions.

## Features Implemented

### 1. **User Management**
- Multi-role authentication (Client, Provider, Admin, Super Admin)
- Email verification
- Profile management with KYC
- Wallet system with transaction tracking

### 2. **Job Marketplace**
- Providers can post services/jobs
- Fixed or negotiable pricing
- Clients can request jobs from specific providers
- Job request workflow:
  - Client creates request → Provider accepts/rejects/negotiates
  - Payment held in escrow
  - Provider completes work
  - Client certifies completion
  - Payment released to provider

### 3. **Payment System (Monify)**
- Secure payment initialization
- Payment verification
- Escrow management
- Automatic payment distribution:
  - 30% advance to provider when job accepted
  - 6% platform fee (deducted from total)
  - Remaining 64% released when client certifies completion
- Withdrawal to bank accounts
- Webhook support for payment callbacks

### 4. **Admin System**
- 5 Admin roles with specific permissions:
  - **Super Admin**: Full platform control, manage other admins
  - **Tech Admin**: Approve provider onboarding, verify sellers
  - **Disputes Admin**: Handle and resolve disputes
  - **Content Admin**: Manage posts, moderate content
  - **Finance Admin**: View transactions, manage payouts

### 5. **Messaging System**
- Real-time messaging between users
- Message conversations tracking
- Attachment support
- Read status

### 6. **Disputes Management**
- Raise disputes when issues occur
- Evidence submission
- Admin review and resolution
- Multiple resolution types:
  - Full refund to client
  - Complete release to provider
  - Split payment

### 7. **Email Notifications**
- Welcome emails
- Email verification
- Job request notifications
- Job acceptance/rejection
- Payment confirmations
- Job completion notifications
- Dispute notifications
- Dispute resolution emails

### 8. **Responsive Design**
- Mobile-first approach
- Fully responsive across all devices
- Touch-friendly UI
- Adaptive layouts

## Environment Setup

### 1. Prerequisites
```bash
- Node.js 18+ installed
- MongoDB Atlas account or local MongoDB
- Monify account for payment processing
- Gmail account for email service (or custom SMTP)
```

### 2. Clone and Install
```bash
git clone <repository-url>
cd oruconnect
npm install
# or
pnpm install
```

### 3. Configure Environment Variables
Create `.env.local` file with the following:

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/oruconnect?retryWrites=true&w=majority

# Monify Payment Gateway
NEXT_PUBLIC_MONIFY_API_URL=https://api.monify.com.ng/v1
MONIFY_SECRET_KEY=your_monify_secret_key
NEXT_PUBLIC_MONIFY_PUBLIC_KEY=your_monify_public_key

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@oruconnect.ng

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRY=7d

# Payment Settings
PLATFORM_FEE_PERCENTAGE=6
PROVIDER_ADVANCE_PERCENTAGE=30

# Feature Flags
ENABLE_TEST_MODE=true
ENABLE_EMAIL_VERIFICATION=true
ENABLE_DISPUTE_SYSTEM=true
```

### 4. Run Development Server
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register user
- `POST /api/auth/register/client` - Register as client
- `POST /api/auth/register/provider` - Register as provider
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email

### Jobs
- `POST /api/jobs/requests/create` - Create job request
- `POST /api/jobs/[id]/accept` - Accept job request
- `POST /api/jobs/requests/[id]/reject` - Reject job request
- `POST /api/jobs/requests/[id]/negotiate` - Counter-propose budget
- `POST /api/jobs/requests/[id]/complete` - Mark job as completed
- `POST /api/jobs/requests/[id]/certify` - Client certifies completion

### Payments
- `POST /api/payments/initialize` - Start payment with Monify
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/withdraw` - Withdraw earnings to bank
- `POST /api/payments/webhook` - Monify webhook handler

### Wallet
- `GET /api/wallet?userId=xyz` - Get wallet balance
- `POST /api/wallet` - Deposit/withdraw from wallet

### Messaging
- `GET /api/messages` - Get conversations/messages
- `POST /api/messages` - Send message

### Disputes
- `GET /api/disputes` - Get disputes
- `POST /api/disputes` - Create dispute
- `POST /api/disputes/[id]/resolve` - Resolve dispute

### Admin
- `GET /api/admin/manage-admins` - List admin users
- `POST /api/admin/manage-admins` - Create admin user
- `PUT /api/admin/manage-admins/[id]` - Update admin status
- `DELETE /api/admin/manage-admins/[id]` - Remove admin user

## Database Models

### User
```typescript
{
  firstName, lastName, email, password,
  role, emailVerified, isApproved,
  phoneNumber, profilePhoto, bio,
  rating, ratingCount, completedJobs,
  bankDetails, walletId, kyc
}
```

### Job
```typescript
{
  title, description, category, provider,
  status, priceType, fixedPrice,
  images, tags, deliveryTime
}
```

### JobRequest
```typescript
{
  jobId, client, provider, status,
  budget, negotiatedBudget, jobDescription,
  timeframe, message, attachments,
  requestedAt, respondedAt, acceptedAt, completedAt
}
```

### Wallet
```typescript
{
  userId, balance, lockedBalance,
  totalEarned, totalSpent,
  lastTransactionDate
}
```

### Escrow
```typescript
{
  jobRequestId, client, provider,
  amount, platformFee, providerAdvance,
  status, monifyReference
}
```

### Transaction
```typescript
{
  transactionId, type, userId, amount,
  status, description, paymentReference,
  platformFee, providerAmount
}
```

### Dispute
```typescript
{
  jobRequestId, escrowId, complainant, defendant,
  title, description, evidence,
  status, resolution, resolutionType,
  resolvedBy, resolvedAt
}
```

### Message & Conversation
```typescript
Message: {
  conversationId, sender, recipient,
  content, attachments, read, createdAt
}

Conversation: {
  participants, relatedJobRequestId,
  lastMessage, lastMessageAt
}
```

### Admin
```typescript
{
  userId, role, permissions,
  assignedBy, status
}
```

## Frontend Components

### Responsive Components
- `NavbarResponsive` - Mobile-optimized navbar
- `ResponsiveContainer` - Flexible container
- `ResponsiveGrid` - Adaptive grid layout
- `ResponsiveFlex` - Flexible flex layout
- `ResponsiveStack` - Vertical stacking
- `ResponsiveSection` - Section wrapper

### Hooks
- `useIsMobile()` - Check if mobile device
- `useBreakpoint()` - Get current breakpoint
- `useMediaQuery()` - Custom media query hook

## Payment Flow

### Client Perspective
1. Client finds provider and requests service
2. Client pays amount (via Monify)
3. Payment held in escrow
4. Provider completes work
5. Client reviews and certifies
6. Full amount (minus platform fee) goes to provider

### Provider Perspective
1. Receive job request
2. Accept job request
3. 30% advance immediately added to wallet
4. Complete job
5. Client certifies
6. Remaining 64% (100% - 30% advance - 6% fee) added to wallet
7. Can withdraw to bank anytime

## Security Implementation

### Authentication
- JWT tokens with expiration
- Secure password hashing with bcryptjs
- Email verification requirement
- Role-based access control

### Data Validation
- Zod schema validation on all API routes
- Input sanitization
- SQL injection prevention
- XSS protection

### Payment Security
- Monify HMAC signature verification for webhooks
- Payment reference verification
- Transaction status checking
- Escrow amount validation

### Database
- MongoDB connection pooling
- Indexed queries for performance
- Proper ObjectId validation

## Email Integration

The system uses Gmail SMTP for sending emails. Set up app-specific password:

1. Enable 2FA on Gmail
2. Generate app-specific password
3. Use the password in `EMAIL_PASSWORD`

Alternatively, configure other SMTP providers in `src/lib/email-service.ts`

## Testing

### Test Mode
Enable test mode in environment variables to bypass authentication.

### Unit Tests
```bash
npm run test
```

### API Tests
Use Postman or curl to test endpoints:

```bash
# Initialize payment
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "email": "client@example.com",
    "jobRequestId": "xyz",
    "userId": "xyz"
  }'
```

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Docker
```bash
docker build -t oruconnect .
docker run -p 3000:3000 oruconnect
```

### Environment Variables on Production
Set all environment variables in your deployment platform's dashboard.

## Troubleshooting

### MongoDB Connection Error
- Check MongoDB URI is correct
- Ensure IP is whitelisted in MongoDB Atlas
- Verify username/password

### Monify API Errors
- Verify API keys are correct
- Check Monify account status
- Ensure test/live mode matches environment

### Email Not Sending
- Verify Gmail app password is correct
- Check email recipient is valid
- Review Nodemailer logs

### Payment Webhook Not Firing
- Ensure webhook URL is publicly accessible
- Verify signature verification is correct
- Check Monify webhook settings

## Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Advanced analytics dashboard
- [ ] Reputation system with badges
- [ ] Video call integration
- [ ] Advanced search with filters
- [ ] Provider portfolio/showcase
- [ ] Automated dispute resolution with AI
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced payment splitting

## Support

For issues and questions:
- Email: support@oruconnect.ng
- Documentation: https://docs.oruconnect.ng
- GitHub Issues: https://github.com/oruconnect/platform/issues

## License

MIT License - See LICENSE file for details

## Contributors

- Your Team

---

Last Updated: February 2026
