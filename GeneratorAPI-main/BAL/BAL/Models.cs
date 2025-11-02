namespace BAL;

public class User
{
    public Int64 Id { get; set; }
    public String Username { get; set; } = String.Empty;
    public String Email { get; set; } = String.Empty;
    public String FullName { get; set; } = String.Empty;
    public String PhoneNumber { get; set; } = String.Empty;
    public String Role { get; set; } = String.Empty; // 'ADMIN' or 'GENERATOR_OWNER'
    public Boolean IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public Int64? GeneratorOwnerId { get; set; }
}

public class GeneratorOwnerRequest
{
    public Int64 Id { get; set; }
    public String OwnerName { get; set; } = String.Empty;
    public String? ContactPerson { get; set; }
    public String PhoneNumber { get; set; } = String.Empty;
    public String? Email { get; set; }
    public String? Address { get; set; }
    public String? Notes { get; set; }
    public String Status { get; set; } = String.Empty; // 'PENDING', 'APPROVED', 'REJECTED'
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public Int64? ReviewedBy { get; set; }
}

public class GeneratorOwner
{
    public Int64 Id { get; set; }
    public Int64 AppUserId { get; set; }
    public String LegalName { get; set; } = String.Empty;
    public String? TradeName { get; set; }
    public String? PhoneNumber { get; set; }
    public String? Address { get; set; }
    public Boolean IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Customer
{
    public Int64 Id { get; set; }
    public String PhoneNumber { get; set; } = String.Empty;
    public String? FirstName { get; set; }
    public String? LastName { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OwnerCustomer
{
    public Int64 Id { get; set; }
    public Int64 GeneratorOwnerId { get; set; }
    public Int64 CustomerId { get; set; }
    public String SubscriptionNumber { get; set; } = String.Empty;
    public String? Zone { get; set; }
    public String? Address { get; set; }
    public Decimal? SubscriptionAmps { get; set; }
    public String BillingMode { get; set; } = String.Empty; // 'METERED' or 'FIXED'
    public String? DefaultNameOnBill { get; set; }
    public Boolean IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    // Joined fields
    public String? PhoneNumber { get; set; }
    public String? FirstName { get; set; }
    public String? LastName { get; set; }
}

public class Bill
{
    public Int64 Id { get; set; }
    public Int64 GeneratorOwnerId { get; set; }
    public Int64 OwnerCustomerId { get; set; }
    public DateTime BillDate { get; set; }
    public Int16? PeriodYear { get; set; }
    public Byte? PeriodMonth { get; set; }
    public Decimal? PreviousKva { get; set; }
    public Decimal? CurrentKva { get; set; }
    public Decimal? SubscriptionFeeVar { get; set; }
    public Decimal? SubscriptionFeeFixed { get; set; }
    public Decimal TotalAmount { get; set; }
    public Decimal? AmountUSD { get; set; }
    public Decimal? AmountLBP { get; set; }
    public String? NameOnBill { get; set; }
    public DateTime? DueDate { get; set; }
    public String? Notes { get; set; }
    public Decimal? SubscriptionAmps { get; set; }
    public String Status { get; set; } = String.Empty; // 'PENDING', 'PAID', 'CANCELLED'
    public DateTime CreatedAt { get; set; }
}

public class SmsCampaign
{
    public Int64 Id { get; set; }
    public Int64 GeneratorOwnerId { get; set; }
    public String Title { get; set; } = String.Empty;
    public String MessageBody { get; set; } = String.Empty;
    public Int16? RelatedPeriodYear { get; set; }
    public Byte? RelatedPeriodMonth { get; set; }
    public Int64 CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SmsMessage
{
    public Int64 Id { get; set; }
    public Int64 SmsCampaignId { get; set; }
    public Int64 OwnerCustomerId { get; set; }
    public String PhoneNumber { get; set; } = String.Empty;
    public String? ProviderMessageId { get; set; }
    public String Status { get; set; } = String.Empty; // 'PENDING', 'SENT', 'DELIVERED', 'FAILED'
    public String? ErrorMessage { get; set; }
    public DateTime? SentAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}

public class ImportBatch
{
    public Int64 Id { get; set; }
    public Int64 GeneratorOwnerId { get; set; }
    public String ImportType { get; set; } = String.Empty; // 'CUSTOMER' or 'BILL'
    public String? OriginalFilename { get; set; }
    public String Status { get; set; } = String.Empty; // 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'
    public DateTime CreatedAt { get; set; }
    public Int64 CreatedByUserId { get; set; }
}

public class ImportBatchRow
{
    public Int64 Id { get; set; }
    public Int64 ImportBatchId { get; set; }
    public Int32 RowNumber { get; set; }
    public String RawDataJson { get; set; } = String.Empty;
    public String Status { get; set; } = String.Empty; // 'PENDING', 'IMPORTED', 'ERROR'
    public String? ErrorMessage { get; set; }
    public Int64? CreatedRecordId { get; set; }
}