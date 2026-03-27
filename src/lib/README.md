# API Implementation Guide

## Overview
This OruConnect platform includes production-ready API stubs for all core functionality. Each endpoint follows RESTful conventions and includes proper error handling and validation.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Business registration

### Search & Discovery
- `GET /api/search` - Search providers
- `GET /api/providers` - List providers
- `GET /api/providers/[id]` - Get provider details
- `GET /api/categories` - List service categories

### Jobs
- `POST /api/jobs/create` - Create job posting
- `GET /api/jobs/[id]` - Get job details
- `POST /api/jobs/[id]/quote` - Submit quotation

### Payments & Escrow
- `POST /api/escrow/create` - Create escrow
- `POST /api/escrow/release` - Release escrow funds
- `POST /api/payments/initialize` - Start payment
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/withdraw` - Withdraw earnings

### Disputes
- `POST /api/disputes/create` - File dispute
- `POST /api/admin/disputes/[id]/resolve` - Resolve dispute

### Messaging
- `POST /api/messaging/send` - Send message
- `GET /api/messaging/conversations` - Get conversations

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/verification` - Pending verifications
- `POST /api/admin/verification/[id]/approve` - Approve business
- `POST /api/admin/verification/[id]/reject` - Reject business
- `GET /api/admin/disputes` - List disputes

## Implementation Notes

### Database Integration
Replace mock data in API routes with actual database queries:
- Use Neon for PostgreSQL (recommended for SQL)
- Use Supabase for PostgreSQL with built-in auth
- Implement proper indexing for performance

### Authentication
Implement JWT token validation middleware for protected routes:
- Store tokens securely in HTTP-only cookies
- Add role-based access control checks
- Implement token refresh mechanism

### Payment Processing
Integrate with payment provider (Stripe, Paystack, Flutterwave):
- Validate payment transactions server-side
- Implement webhook handlers for payment confirmation
- Handle payment errors and retries

### Security
- Validate all inputs with Zod schemas
- Sanitize user data to prevent injection attacks
- Implement rate limiting on public endpoints
- Add request logging and audit trails
- Use HTTPS for all communications

### Error Handling
All routes include standardized error responses with:
- Descriptive error messages
- Proper HTTP status codes
- Request validation
- Try-catch blocks for unexpected errors

## Testing Mock Data
To test the platform with mock credentials:

**Client Login:**
- Email: client@test.com
- Password: password123

**Provider Login:**
- Email: provider@test.com
- Password: password123

**Admin Login:**
- Email: admin@test.com
- Password: password123
