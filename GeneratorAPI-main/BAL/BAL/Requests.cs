using System.ComponentModel.DataAnnotations;

namespace BAL;

public class SignInRequest
{
    [Required(ErrorMessage = "Email address is required.")]
    [DataType(DataType.EmailAddress)]
    [EmailAddress(ErrorMessage = "Email address is invalid.")]
    public String Email { get; set; } = String.Empty;
    
    [Required(ErrorMessage = "Password is required.")]
    [DataType(DataType.Password)]
    public String Password { get; set; } = String.Empty;
}

public class RequestUpdateRequest
{
    [Required]
    public String Status { get; set; } = String.Empty; // 'PENDING', 'APPROVED', 'REJECTED'
    public String? Notes { get; set; }
}

public class CustomerUpsertRequest
{
    public Int64? Id { get; set; }
    [Required]
    public String PhoneNumber { get; set; } = String.Empty;
    public String? FirstName { get; set; }
    public String? LastName { get; set; }
    [Required]
    public String SubscriptionNumber { get; set; } = String.Empty;
    public String? Zone { get; set; }
    public String? Address { get; set; }
    public Decimal? SubscriptionAmps { get; set; }
    [Required]
    public String BillingMode { get; set; } = String.Empty; // 'METERED' or 'FIXED'
    public String? DefaultNameOnBill { get; set; }
    public Boolean IsActive { get; set; } = true;
}

public class BillCreateRequest
{
    [Required]
    public Int64 OwnerCustomerId { get; set; }
    [Required]
    public DateTime BillDate { get; set; }
    public Int16? PeriodYear { get; set; }
    public Byte? PeriodMonth { get; set; }
    public Decimal? PreviousKva { get; set; }
    public Decimal? CurrentKva { get; set; }
    public Decimal? SubscriptionFeeVar { get; set; }
    public Decimal? SubscriptionFeeFixed { get; set; }
    [Required]
    public Decimal TotalAmount { get; set; }
    public Decimal? AmountUSD { get; set; }
    public Decimal? AmountLBP { get; set; }
    public String? NameOnBill { get; set; }
    public DateTime? DueDate { get; set; }
    public String? Notes { get; set; }
    public Decimal? SubscriptionAmps { get; set; }
}

public class BillUpdateRequest
{
    public DateTime? BillDate { get; set; }
    public Int16? PeriodYear { get; set; }
    public Byte? PeriodMonth { get; set; }
    public Decimal? PreviousKva { get; set; }
    public Decimal? CurrentKva { get; set; }
    public Decimal? SubscriptionFeeVar { get; set; }
    public Decimal? SubscriptionFeeFixed { get; set; }
    public Decimal? TotalAmount { get; set; }
    public Decimal? AmountUSD { get; set; }
    public Decimal? AmountLBP { get; set; }
    public String? NameOnBill { get; set; }
    public DateTime? DueDate { get; set; }
    public String? Notes { get; set; }
    public Decimal? SubscriptionAmps { get; set; }
    public String? Status { get; set; }
}

public class CustomerImportRequest
{
    public List<CustomerImportRowRequest> Rows { get; set; } = new();
    public String? OriginalFilename { get; set; }
}

public class CustomerImportRowRequest
{
    public String PhoneNumber { get; set; } = String.Empty;
    public String? FirstName { get; set; }
    public String? LastName { get; set; }
    public String SubscriptionNumber { get; set; } = String.Empty;
    public String? Zone { get; set; }
    public String? Address { get; set; }
    public Decimal? SubscriptionAmps { get; set; }
    public String? BillingMode { get; set; }
    public String? DefaultNameOnBill { get; set; }
    public Boolean? IsActive { get; set; }
}

public class BillImportRequest
{
    public List<BillImportRowRequest> Rows { get; set; } = new();
    public String? OriginalFilename { get; set; }
}

public class BillImportRowRequest
{
    public String SubscriptionNumber { get; set; } = String.Empty;
    public Int16 PeriodYear { get; set; }
    public Byte PeriodMonth { get; set; }
    public Decimal TotalAmount { get; set; }
    public Decimal? PreviousKva { get; set; }
    public Decimal? CurrentKva { get; set; }
    public Decimal? SubscriptionFeeVar { get; set; }
    public Decimal? SubscriptionFeeFixed { get; set; }
    public String? NameOnBill { get; set; }
    public DateTime? DueDate { get; set; }
    public String? Notes { get; set; }
    public Decimal? SubscriptionAmps { get; set; }
}

public class SmsTemplateUpsertRequest
{
    public Int64? Id { get; set; }
    [Required]
    public String Name { get; set; } = String.Empty;
    [Required]
    public String Body { get; set; } = String.Empty;
}

public class SmsCampaignUpsertRequest
{
    public Int64? Id { get; set; }
    [Required]
    public String Title { get; set; } = String.Empty;
    [Required]
    public String MessageBody { get; set; } = String.Empty;
    public Int16? RelatedPeriodYear { get; set; }
    public Byte? RelatedPeriodMonth { get; set; }
    public List<String> TargetSegments { get; set; } = new();
}

public class CheckBillRequest
{
    [Required]
    public String PhoneNumber { get; set; } = String.Empty;
    public String? SubscriptionNumber { get; set; }
}
