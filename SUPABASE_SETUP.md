# Supabase Setup Instructions

## Overview
This application uses Supabase for authentication and database management. Follow these steps to properly configure Supabase.

## Prerequisites
- A Supabase account (free tier is sufficient for development)
- Your project should be connected to a Supabase project

## Step 1: Get Your Supabase Project Details

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project or create a new one
3. Go to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **anon public** key
   - **service_role** key

## Step 2: Update Environment Variables

1. Open the `.env` file in your project root
2. Replace the placeholder values with your actual Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## Step 3: Database Setup

The application will automatically create the necessary database tables when it runs. However, you can manually create them if needed:

### Tables Created Automatically:
- `customers` - Customer information
- `sales_orders` - Sales order management
- `sales_order_items` - Individual items in sales orders
- `work_orders` - Production work orders
- `production_stage_history` - Production stage tracking
- `quality_inspections` - Quality control records
- `customer_communications` - Communication tracking
- `user_roles` - User role management

## Step 4: Authentication Configuration

The application uses Supabase Auth with the following features:

### User Roles:
- **admin** - Full system access
- **production-manager** - Manage production and orders
- **quality-inspector** - Quality control management
- **viewer** - Read-only access

### Authentication Flow:
1. Users sign up with email/password
2. During signup, they select a role
3. Their role is stored in the `user_roles` table
4. Permissions are enforced throughout the application

## Step 5: Testing the Setup

1. Restart your development server
2. Navigate to `/sign-up`
3. Create a new account with any role
4. Verify you can sign in and access appropriate features

## Troubleshooting

### "supabaseUrl is required" Error
- Make sure `NEXT_PUBLIC_SUPABASE_URL` is set in your `.env` file
- Verify the URL is correct (should start with `https://`)

### Authentication Not Working
- Check that your anon key is correct
- Ensure your Supabase project has Auth enabled
- Verify the email provider is configured in Supabase

### Database Errors
- Make sure your `DATABASE_URL` in `.env` matches your Supabase project
- Run the database migrations if needed

## Security Notes

- Keep your service role key secret and never expose it in client-side code
- The anon key is safe to use in client-side applications
- Regularly rotate your keys if they're compromised

## Support

If you encounter issues:
1. Check the Supabase [documentation](https://supabase.com/docs)
2. Verify all environment variables are set correctly
3. Ensure your Supabase project is active and properly configured