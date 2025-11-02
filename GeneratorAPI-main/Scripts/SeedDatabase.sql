-- =============================================
-- Database Seeding Script
-- Generator API Initial Data
-- =============================================

USE [YourDatabaseName]; -- Change to your database name
GO

-- =============================================
-- 1. Create Admin User
-- =============================================

DECLARE @AdminPasswordHash VARCHAR(255) = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; -- SHA256 hash of "admin"
DECLARE @AdminUserId BIGINT;

-- Insert Admin User
INSERT INTO dbo.AppUser (Username, PasswordHash, FullName, Email, Role, IsActive)
VALUES ('admin', @AdminPasswordHash, 'System Administrator', 'admin@generator.com', 'ADMIN', 1);

SET @AdminUserId = SCOPE_IDENTITY();
PRINT 'Admin user created with ID: ' + CAST(@AdminUserId AS VARCHAR(20));
GO

-- =============================================
-- 2. Create Sample Generator Owner Request
-- =============================================

DECLARE @RequestId BIGINT;

INSERT INTO dbo.GeneratorOwnerRequest (
    OwnerName, ContactPerson, PhoneNumber, Email, Address, Notes, Status
)
VALUES (
    'ABC Generator Services',
    'John Doe',
    '+9611234567',
    'contact@abcgenerator.com',
    'Beirut, Lebanon',
    'Initial registration request',
    'PENDING'
);

SET @RequestId = SCOPE_IDENTITY();
PRINT 'Generator Owner Request created with ID: ' + CAST(@RequestId AS VARCHAR(20));
GO

-- =============================================
-- 3. Create Approved Generator Owner & User
-- =============================================

DECLARE @GeneratorOwnerPasswordHash VARCHAR(255) = '4c1029697ee358715d3a14a2add817c4b01651440de808371f78165ac90dc581'; -- SHA256 hash of "owner"
DECLARE @OwnerUserId BIGINT;
DECLARE @GeneratorOwnerId BIGINT;

-- Create Generator Owner User Account
INSERT INTO dbo.AppUser (Username, PasswordHash, FullName, Email, PhoneNumber, Role, IsActive)
VALUES (
    'generator_owner',
    @GeneratorOwnerPasswordHash,
    'Generator Owner',
    'owner@generator.com',
    '+9619876543',
    'GENERATOR_OWNER',
    1
);

SET @OwnerUserId = SCOPE_IDENTITY();

-- Create Generator Owner Record
INSERT INTO dbo.GeneratorOwner (AppUserId, LegalName, TradeName, PhoneNumber, Address, IsActive)
VALUES (
    @OwnerUserId,
    'ABC Generator Services LLC',
    'ABC Generator',
    '+9611234567',
    'Beirut, Lebanon',
    1
);

SET @GeneratorOwnerId = SCOPE_IDENTITY();
PRINT 'Generator Owner created with ID: ' + CAST(@GeneratorOwnerId AS VARCHAR(20));
PRINT 'Generator Owner User ID: ' + CAST(@OwnerUserId AS VARCHAR(20));
GO

-- =============================================
-- 4. Create Sample Customers
-- =============================================

DECLARE @GeneratorOwnerId BIGINT = (SELECT TOP 1 Id FROM dbo.GeneratorOwner ORDER BY Id DESC);
DECLARE @Customer1Id BIGINT;
DECLARE @Customer2Id BIGINT;
DECLARE @Customer3Id BIGINT;

-- Customer 1
INSERT INTO dbo.Customer (PhoneNumber, FirstName, LastName)
VALUES ('+9613123456', 'Ahmad', 'Khalil');
SET @Customer1Id = SCOPE_IDENTITY();

-- Customer 2
INSERT INTO dbo.Customer (PhoneNumber, FirstName, LastName)
VALUES ('+9613234567', 'Fatima', 'Al-Ahmad');
SET @Customer2Id = SCOPE_IDENTITY();

-- Customer 3
INSERT INTO dbo.Customer (PhoneNumber, FirstName, LastName)
VALUES ('+9613345678', 'Mohammad', 'Hassan');
SET @Customer3Id = SCOPE_IDENTITY();

PRINT 'Customers created: ' + CAST(@Customer1Id AS VARCHAR(20)) + ', ' + CAST(@Customer2Id AS VARCHAR(20)) + ', ' + CAST(@Customer3Id AS VARCHAR(20));
GO

-- =============================================
-- 5. Create Owner-Customer Subscriptions
-- =============================================

DECLARE @GeneratorOwnerId BIGINT = (SELECT TOP 1 Id FROM dbo.GeneratorOwner ORDER BY Id DESC);
DECLARE @Customer1Id BIGINT = (SELECT TOP 1 Id FROM dbo.Customer WHERE PhoneNumber = '+9613123456');
DECLARE @Customer2Id BIGINT = (SELECT TOP 1 Id FROM dbo.Customer WHERE PhoneNumber = '+9613234567');
DECLARE @Customer3Id BIGINT = (SELECT TOP 1 Id FROM dbo.Customer WHERE PhoneNumber = '+9613345678');

DECLARE @Sub1Id BIGINT;
DECLARE @Sub2Id BIGINT;
DECLARE @Sub3Id BIGINT;

-- Subscription 1 - Metered
INSERT INTO dbo.OwnerCustomer (
    GeneratorOwnerId, CustomerId, SubscriptionNumber, Zone, Address,
    SubscriptionAmps, BillingMode, DefaultNameOnBill, IsActive
)
VALUES (
    @GeneratorOwnerId, @Customer1Id, 'SUB-001', 'Achrafieh', 'Achrafieh, Beirut',
    50.00, 'METERED', 'Ahmad Khalil', 1
);
SET @Sub1Id = SCOPE_IDENTITY();

-- Subscription 2 - Fixed
INSERT INTO dbo.OwnerCustomer (
    GeneratorOwnerId, CustomerId, SubscriptionNumber, Zone, Address,
    SubscriptionAmps, BillingMode, DefaultNameOnBill, IsActive
)
VALUES (
    @GeneratorOwnerId, @Customer2Id, 'SUB-002', 'Hamra', 'Hamra, Beirut',
    30.00, 'FIXED', 'Fatima Al-Ahmad', 1
);
SET @Sub2Id = SCOPE_IDENTITY();

-- Subscription 3 - Metered
INSERT INTO dbo.OwnerCustomer (
    GeneratorOwnerId, CustomerId, SubscriptionNumber, Zone, Address,
    SubscriptionAmps, BillingMode, DefaultNameOnBill, IsActive
)
VALUES (
    @GeneratorOwnerId, @Customer3Id, 'SUB-003', 'Verdun', 'Verdun, Beirut',
    40.00, 'METERED', 'Mohammad Hassan', 1
);
SET @Sub3Id = SCOPE_IDENTITY();

PRINT 'Subscriptions created: ' + CAST(@Sub1Id AS VARCHAR(20)) + ', ' + CAST(@Sub2Id AS VARCHAR(20)) + ', ' + CAST(@Sub3Id AS VARCHAR(20));
GO

-- =============================================
-- 6. Create Sample Bills
-- =============================================

DECLARE @GeneratorOwnerId BIGINT = (SELECT TOP 1 Id FROM dbo.GeneratorOwner ORDER BY Id DESC);
DECLARE @Sub1Id BIGINT = (SELECT Id FROM dbo.OwnerCustomer WHERE SubscriptionNumber = 'SUB-001');
DECLARE @Sub2Id BIGINT = (SELECT Id FROM dbo.OwnerCustomer WHERE SubscriptionNumber = 'SUB-002');
DECLARE @Sub3Id BIGINT = (SELECT Id FROM dbo.OwnerCustomer WHERE SubscriptionNumber = 'SUB-003');

-- Bill 1 - PENDING
INSERT INTO dbo.Bill (
    GeneratorOwnerId, OwnerCustomerId, BillDate, PeriodYear, PeriodMonth,
    PreviousKva, CurrentKva, SubscriptionFeeVar, SubscriptionFeeFixed,
    TotalAmount, AmountUSD, NameOnBill, DueDate, Status, SubscriptionAmps
)
VALUES (
    @GeneratorOwnerId, @Sub1Id, CAST('2025-01-15' AS DATE), 2025, 1,
    100.00, 150.00, 75.00, 25.00,
    100.00, 100.00, 'Ahmad Khalil', CAST('2025-02-15' AS DATE), 'PENDING', 50.00
);

-- Bill 2 - PAID
INSERT INTO dbo.Bill (
    GeneratorOwnerId, OwnerCustomerId, BillDate, PeriodYear, PeriodMonth,
    SubscriptionFeeFixed, TotalAmount, AmountUSD, NameOnBill, DueDate, Status, SubscriptionAmps
)
VALUES (
    @GeneratorOwnerId, @Sub2Id, CAST('2024-12-15' AS DATE), 2024, 12,
    50.00, 50.00, 50.00, 'Fatima Al-Ahmad', CAST('2025-01-15' AS DATE), 'PAID', 30.00
);

-- Bill 3 - PENDING
INSERT INTO dbo.Bill (
    GeneratorOwnerId, OwnerCustomerId, BillDate, PeriodYear, PeriodMonth,
    PreviousKva, CurrentKva, SubscriptionFeeVar, SubscriptionFeeFixed,
    TotalAmount, AmountUSD, NameOnBill, DueDate, Status, SubscriptionAmps
)
VALUES (
    @GeneratorOwnerId, @Sub3Id, CAST('2025-01-10' AS DATE), 2025, 1,
    200.00, 280.00, 120.00, 30.00,
    150.00, 150.00, 'Mohammad Hassan', CAST('2025-02-10' AS DATE), 'PENDING', 40.00
);

PRINT 'Sample bills created';
GO

-- =============================================
-- 7. Create SMS Template Table (if not exists)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.SmsTemplate') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.SmsTemplate (
        Id BIGINT IDENTITY(1,1) PRIMARY KEY,
        GeneratorOwnerId BIGINT NOT NULL,
        Name VARCHAR(150) NOT NULL,
        Body NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SmsTemplate_CreatedAt DEFAULT (SYSUTCDATETIME()),
        UpdatedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SmsTemplate_UpdatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT FK_SmsTemplate_Owner FOREIGN KEY (GeneratorOwnerId) REFERENCES dbo.GeneratorOwner(Id)
    );
    PRINT 'SmsTemplate table created';
END
ELSE
BEGIN
    PRINT 'SmsTemplate table already exists';
END
GO

-- =============================================
-- 8. Create Sample SMS Templates
-- =============================================

DECLARE @GeneratorOwnerId BIGINT = (SELECT TOP 1 Id FROM dbo.GeneratorOwner ORDER BY Id DESC);

INSERT INTO dbo.SmsTemplate (GeneratorOwnerId, Name, Body)
VALUES 
    (@GeneratorOwnerId, 'Bill Reminder', 'Dear {Name}, your bill #{BillNumber} for {Period} is due on {DueDate}. Amount: ${Amount}. Please pay to avoid service interruption.'),
    (@GeneratorOwnerId, 'Payment Confirmation', 'Thank you {Name}! Your payment of ${Amount} for bill #{BillNumber} has been received.'),
    (@GeneratorOwnerId, 'Service Notice', 'Dear {Name}, we will be performing maintenance on {Date} from {Time}. We apologize for any inconvenience.');

PRINT 'SMS templates created';
GO

-- =============================================
-- Summary
-- =============================================

PRINT '========================================';
PRINT 'Database seeding completed!';
PRINT '========================================';
PRINT 'Default credentials:';
PRINT '  Admin: admin@generator.com / admin';
PRINT '  Owner: owner@generator.com / owner';
PRINT '========================================';
GO

