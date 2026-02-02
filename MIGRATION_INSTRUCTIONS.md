# Migration Instructions for Login Fix

## Problem
Login was not working in production because password validation was completely disabled. Anyone could log in with any email address if it existed in the database, regardless of the password entered.

## Changes Made
1. Added `passwordHash` field to User model in Prisma schema
2. Updated signup route to hash and store passwords using bcrypt
3. Enabled password validation in NextAuth credentials provider
4. Created database migration to add the passwordHash column

## Database Migration Required

**IMPORTANT:** Before deploying this fix, you must apply the database migration in production.

### Option 1: Using Prisma Migrate (Recommended)
In production, run:
```bash
npx prisma migrate deploy
```

In development, run:
```bash
npx prisma migrate dev --name add-password-hash
```

This will create and apply a migration that adds the `passwordHash` column to the User table.

### Option 2: Manual SQL Execution
If you prefer to run the SQL directly, execute:
```sql
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
```

**Note:** Migrations are not committed to the repository as per .gitignore configuration. They will be generated when you run the migration commands above.

## Post-Migration Steps

### For Existing Users
Existing users who signed up before this fix will have `NULL` in their `passwordHash` field:
- They will see an error: "Password not set for this account. Please use OAuth login."
- They should use Google or GitHub OAuth to log in
- Alternatively, you can create a password reset flow to allow them to set passwords

### For New Users
New users signing up after this fix will have their passwords properly hashed and stored.

## Security Notes
- Passwords are now hashed using bcrypt with 10 salt rounds
- Password validation is properly enforced
- OAuth users (Google/GitHub) will continue to work as before (passwordHash will be NULL for them)

## Testing
To test the fix:
1. Create a new user account via signup
2. Verify the password is stored (check database)
3. Try logging in with correct password (should succeed)
4. Try logging in with incorrect password (should fail)
5. Try logging in with non-existent email (should fail)
