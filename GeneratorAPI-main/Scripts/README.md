# Database Setup Scripts

## SeedDatabase.sql

This script seeds the database with initial test data including:

1. **Admin User**
   - Email: `admin@generator.com`
   - Password: `admin`
   - Role: ADMIN

2. **Generator Owner User**
   - Email: `owner@generator.com`
   - Password: `owner`
   - Role: GENERATOR_OWNER

3. **Sample Data**
   - 1 Generator Owner Request (PENDING)
   - 3 Customers
   - 3 Owner-Customer Subscriptions
   - 3 Bills (2 PENDING, 1 PAID)
   - 3 SMS Templates

## Usage

1. Update the database name in the script:
   ```sql
   USE [YourDatabaseName]; -- Change this
   ```

2. Run the script in SQL Server Management Studio or your SQL client:
   ```sql
   -- Execute the entire SeedDatabase.sql file
   ```

3. Verify the data was created:
   ```sql
   SELECT * FROM dbo.AppUser;
   SELECT * FROM dbo.GeneratorOwner;
   SELECT * FROM dbo.Customer;
   SELECT * FROM dbo.OwnerCustomer;
   SELECT * FROM dbo.Bill;
   ```

## Default Passwords

All passwords are hashed using SHA-256. The default passwords are:
- Admin: `admin`
- Owner: `owner`

**Important**: Change these passwords in production!

## Notes

- The script creates the `SmsTemplate` table if it doesn't exist
- All dates use UTC timestamps
- Phone numbers are in Lebanese format (+961...)
- Sample bills are for January 2025

