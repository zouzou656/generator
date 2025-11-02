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
public class RequestsController(ILogger<RequestsController> logger, RequestsBal requestsBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<List<GeneratorOwnerRequest>>>> GetRequests()
    {
        List<GeneratorOwnerRequest> requests = await requestsBal.GetRequests();
        
        ApiResponse<List<GeneratorOwnerRequest>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = requests,
            Message = successMessages.GetMessage("GetRequests")
        };
        
        return Ok(resp);
    }
    
    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<GeneratorOwnerRequest>>> GetRequest(Int64 id)
    {
        GeneratorOwnerRequest? request = await requestsBal.GetRequest(id);
        if (request == null)
        {
            throw new NotFoundException($"Request {id} not found.");
        }
        
        ApiResponse<GeneratorOwnerRequest> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = request,
            Message = successMessages.GetMessage("GetRequest")
        };
        
        return Ok(resp);
    }
    
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<GeneratorOwnerRequest>>> UpdateRequest(Int64 id, RequestUpdateRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 reviewedBy = GetCurrentUserId();
        GeneratorOwnerRequest updated = await requestsBal.UpdateRequest(id, request, reviewedBy);
        
        ApiResponse<GeneratorOwnerRequest> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = updated,
            Message = successMessages.GetMessage("UpdateRequest")
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
    private String GetFirstErrorMsgFromModelState()
    {
        return ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault() ?? "Validation exception occured.";
    }
}

