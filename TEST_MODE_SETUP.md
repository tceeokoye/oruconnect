# OruConnect Test Mode Setup

## Overview
Test Mode allows you to bypass authentication and switch between different user roles to test all dashboards and features without needing multiple accounts.

## Enabling Test Mode

### Option 1: Environment Variable (Recommended)
Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_TEST_MODE=true
```

Then restart your development server.

### Option 2: Use Test Credentials on Login
Go to `/auth/login` and click "Use Test Credentials" button to automatically fill:
- **Email**: truthokoye@gmail.com
- **Password**: youngtee

This will enable test mode and log you in.

## Test Credentials
All test accounts use the same credentials:
- **Email**: truthokoye@gmail.com
- **Password**: youngtee

## Switching Roles

Once logged in with test mode enabled:
1. Look for the role switcher in the navbar (desktop view)
2. Select from: Client, Provider, Sub Admin, Admin, Super Admin
3. The dashboard will update immediately to match the selected role

## Available Dashboards

### Client Dashboard
- Access at: `/` or `/client/jobs`
- View available providers
- Create and manage jobs
- Track escrow payments
- Browse service provider feed

### Provider Dashboard
- Access at: `/dashboard`
- Manage your business profile
- Create and manage posts
- View jobs and quotes
- Track earnings in wallet

### Admin Dashboard
- Access at: `/admin/dashboard`
- Review and verify business registrations
- Moderate provider posts
- Handle disputes
- View platform analytics

### Super Admin Dashboard
- Access at: `/admin/dashboard` (same as Admin)
- Manage admins and sub-admins
- Create categories and subcategories
- Full platform control

## Features to Test

### Comments System
1. Go to landing page or providers list
2. Find a post
3. Click the comment icon to open comment panel
4. Add comments (they appear instantly)
5. Comments are stored in-memory (reset on server restart)

### Share Functionality
1. Click the share icon on any post
2. Choose: Copy Link, WhatsApp, Twitter/X, or Facebook
3. Share count increments instantly

### Post Creation (Provider Role)
1. Switch to Provider role
2. Go to `/dashboard/posts`
3. Click "Create" tab
4. Create text or video posts
5. Posts appear in provider's portfolio

### Admin Moderation (Admin Role)
1. Switch to Admin or Super Admin role
2. Go to `/admin/posts`
3. Review pending posts
4. Approve, hide, or delete posts
5. Changes reflect immediately

## Important Notes

- Test mode is **development only**
- All data is stored in-memory and resets when server restarts
- Comments and posts created during one session may disappear after restart
- Do not enable test mode in production
- Authentication logic remains intact and can be toggled off by removing the env variable

## Disabling Test Mode

1. Delete or comment out `NEXT_PUBLIC_TEST_MODE=true` in `.env.local`
2. Restart development server
3. Real authentication will be enforced

## Troubleshooting

**Q: Role switcher not showing**
- Make sure test mode is enabled (check banner at top of navbar)
- Make sure you're logged in

**Q: Can't access dashboard**
- Login with test credentials first
- Check that test mode banner is visible
- Try switching role again

**Q: Comments/shares not persisting**
- They are stored in-memory only
- Restart the server to clear them
- Create new ones for testing

**Q: Want to test real authentication?**
- Disable test mode via env variable
- Create account via `/auth/register`
- Login with real credentials
```

Now create a share API stub route for tracking (optional):
