using BAL;
using GeneratorAPI.Common;
using GeneratorAPI.Providers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneratorAPI.Controllers;

[ApiController]
[Route("[controller]")]
[AllowAnonymous]
public class PortalController(ILogger<PortalController> logger, PortalBal portalBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpPost("CheckBill")]
    public async Task<ActionResult<ApiResponse<CheckBillResult>>> GetBillsByPhone(CheckBillRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        CheckBillResult result = await portalBal.GetBillsByPhone(request.PhoneNumber, request.SubscriptionNumber);
        
        ApiResponse<CheckBillResult> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = result,
            Message = successMessages.GetMessage("CheckBill")
        };
        
        return Ok(resp);
    }
    
    [HttpGet("Bills/{subscriptionNumber}")]
    public async Task<ActionResult<ApiResponse<List<Bill>>>> GetBillsBySubscriptionNumber(String subscriptionNumber)
    {
        List<Bill> bills = await portalBal.GetBillsBySubscriptionNumber(subscriptionNumber);
        
        ApiResponse<List<Bill>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = bills,
            Message = successMessages.GetMessage("GetBillsBySubscriptionNumber")
        };
        
        return Ok(resp);
    }
    
    [HttpGet("Bills")]
    public async Task<ActionResult<ApiResponse<List<Bill>>>> GetAllBills()
    {
        List<Bill> bills = await portalBal.GetAllBills();
        
        ApiResponse<List<Bill>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = bills,
            Message = successMessages.GetMessage("GetAllBills")
        };
        
        return Ok(resp);
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

