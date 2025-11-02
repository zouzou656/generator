using System.Security.Claims;
using BAL;
using GeneratorAPI.Common;
using GeneratorAPI.Providers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneratorAPI.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize]
public class OwnerCustomersController(ILogger<OwnerCustomersController> logger, OwnerCustomersBal ownerCustomersBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<OwnerCustomer>>>> GetOwnerCustomers()
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        List<OwnerCustomer> customers = await ownerCustomersBal.GetOwnerCustomers(generatorOwnerId);
        
        ApiResponse<List<OwnerCustomer>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = customers,
            Message = successMessages.GetMessage("GetOwnerCustomers")
        };
        
        return Ok(resp);
    }
    
    [HttpPost]
    public async Task<ActionResult<ApiResponse<OwnerCustomer>>> UpsertOwnerCustomer(CustomerUpsertRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        OwnerCustomer customer = await ownerCustomersBal.UpsertOwnerCustomer(generatorOwnerId, request);
        
        ApiResponse<OwnerCustomer> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = customer,
            Message = successMessages.GetMessage("UpsertOwnerCustomer")
        };
        
        return Ok(resp);
    }
    
    [HttpPost("CheckUnique")]
    public async Task<ActionResult<ApiResponse<Boolean>>> CheckCustomerUnique(CustomerUniqueCheckRequest request)
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        Boolean isUnique = await ownerCustomersBal.CheckCustomerUnique(generatorOwnerId, request.PhoneNumber, request.SubscriptionNumber);
        
        ApiResponse<Boolean> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = isUnique,
            Message = successMessages.GetMessage("CheckCustomerUnique")
        };
        
        return Ok(resp);
    }
    
    [HttpPost("Import")]
    public async Task<ActionResult<ApiResponse<ImportBatch>>> ImportCustomers(CustomerImportRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        Int64 createdByUserId = GetCurrentUserId();
        ImportBatch batch = await ownerCustomersBal.ImportCustomers(generatorOwnerId, request, createdByUserId);
        
        ApiResponse<ImportBatch> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = batch,
            Message = successMessages.GetMessage("ImportCustomers")
        };
        
        return Ok(resp);
    }
    
    [NonAction]
    private Int64 GetCurrentUserId()
    {
        String? userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (String.IsNullOrEmpty(userIdStr) || !Int64.TryParse(userIdStr, out Int64 userId))
        {
            throw new UnauthorizedException("User ID not found in token.");
        }
        return userId;
    }
    
    [NonAction]
    private Int64 GetCurrentGeneratorOwnerId()
    {
        // For now, we'll get it from the user's GeneratorOwnerId
        // In production, you might want to query the user to get their owner ID
        // For simplicity, assuming we can get it from a claim or need to query
        // This will be set during login and added to claims
        String? ownerIdStr = User.FindFirst("GeneratorOwnerId")?.Value;
        if (String.IsNullOrEmpty(ownerIdStr) || !Int64.TryParse(ownerIdStr, out Int64 ownerId))
        {
            throw new UnauthorizedException("Generator Owner ID not found. User may not be a generator owner.");
        }
        return ownerId;
    }
    
    [NonAction]
    private String GetFirstErrorMsgFromModelState()
    {
        return ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault() ?? "Validation exception occured.";
    }
}

public class CustomerUniqueCheckRequest
{
    public String? PhoneNumber { get; set; }
    public String? SubscriptionNumber { get; set; }
}

