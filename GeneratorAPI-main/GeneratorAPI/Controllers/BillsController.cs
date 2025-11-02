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
public class BillsController(ILogger<BillsController> logger, BillsBal billsBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<Bill>>>> GetBills()
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        List<Bill> bills = await billsBal.GetBills(generatorOwnerId);
        
        ApiResponse<List<Bill>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = bills,
            Message = successMessages.GetMessage("GetBills")
        };
        
        return Ok(resp);
    }
    
    [HttpPost]
    public async Task<ActionResult<ApiResponse<Bill>>> CreateBill(BillCreateRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        Bill bill = await billsBal.CreateBill(generatorOwnerId, request);
        
        ApiResponse<Bill> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = bill,
            Message = successMessages.GetMessage("CreateBill")
        };
        
        return Ok(resp);
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<Bill>>> UpdateBill(Int64 id, BillUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        Bill bill = await billsBal.UpdateBill(id, generatorOwnerId, request);
        
        ApiResponse<Bill> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = bill,
            Message = successMessages.GetMessage("UpdateBill")
        };
        
        return Ok(resp);
    }
    
    [HttpPost("Import")]
    public async Task<ActionResult<ApiResponse<ImportBatch>>> ImportBills(BillImportRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        Int64 createdByUserId = GetCurrentUserId();
        ImportBatch batch = await billsBal.ImportBills(generatorOwnerId, request, createdByUserId);
        
        ApiResponse<ImportBatch> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = batch,
            Message = successMessages.GetMessage("ImportBills")
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

