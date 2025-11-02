-- =============================================
-- Portal Stored Procedures
-- Public endpoints for bill retrieval
-- =============================================

USE [YourDatabaseName]; -- Change to your database name
GO

-- =============================================
-- Get Bills by Subscription Number
-- =============================================

CREATE OR ALTER PROCEDURE dbo.sp_GetBillsBySubscriptionNumber
    @p_SubscriptionNumber VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        b.Id,
        b.GeneratorOwnerId,
        b.OwnerCustomerId,
        b.BillDate,
        b.PeriodYear,
        b.PeriodMonth,
        b.PreviousKva,
        b.CurrentKva,
        b.SubscriptionFeeVar,
        b.SubscriptionFeeFixed,
        b.TotalAmount,
        b.AmountUSD,
        b.AmountLBP,
        b.NameOnBill,
        b.DueDate,
        b.Notes,
        b.SubscriptionAmps,
        b.Status,
        b.CreatedAt
    FROM dbo.Bill b
    INNER JOIN dbo.OwnerCustomer oc ON oc.Id = b.OwnerCustomerId
    WHERE oc.SubscriptionNumber = @p_SubscriptionNumber
      AND oc.IsActive = 1
    ORDER BY b.BillDate DESC, b.CreatedAt DESC;
END;
GO

-- =============================================
-- Get All Bills (Public)
-- =============================================

CREATE OR ALTER PROCEDURE dbo.sp_GetAllBills
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        b.Id,
        b.GeneratorOwnerId,
        b.OwnerCustomerId,
        b.BillDate,
        b.PeriodYear,
        b.PeriodMonth,
        b.PreviousKva,
        b.CurrentKva,
        b.SubscriptionFeeVar,
        b.SubscriptionFeeFixed,
        b.TotalAmount,
        b.AmountUSD,
        b.AmountLBP,
        b.NameOnBill,
        b.DueDate,
        b.Notes,
        b.SubscriptionAmps,
        b.Status,
        b.CreatedAt
    FROM dbo.Bill b
    INNER JOIN dbo.OwnerCustomer oc ON oc.Id = b.OwnerCustomerId
    WHERE oc.IsActive = 1
    ORDER BY b.BillDate DESC, b.CreatedAt DESC;
END;
GO

PRINT 'Portal stored procedures created successfully.';
GO

