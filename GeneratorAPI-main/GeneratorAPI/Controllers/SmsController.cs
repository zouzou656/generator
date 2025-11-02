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
public class SmsController(ILogger<SmsController> logger, SmsBal smsBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpGet("Templates")]
    public async Task<ActionResult<ApiResponse<List<SmsTemplateRecord>>>> GetSmsTemplates()
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        List<SmsTemplateRecord> templates = await smsBal.GetSmsTemplates(generatorOwnerId);
        
        ApiResponse<List<SmsTemplateRecord>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = templates,
            Message = successMessages.GetMessage("GetSmsTemplates")
        };
        
        return Ok(resp);
    }
    
    [HttpPost("Templates")]
    public async Task<ActionResult<ApiResponse<SmsTemplateRecord>>> UpsertSmsTemplate(SmsTemplateUpsertRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        SmsTemplateRecord template = await smsBal.UpsertSmsTemplate(generatorOwnerId, request);
        
        ApiResponse<SmsTemplateRecord> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = template,
            Message = successMessages.GetMessage("UpsertSmsTemplate")
        };
        
        return Ok(resp);
    }
    
    [HttpDelete("Templates/{id}")]
    public async Task<ActionResult<ApiResponse<Object?>>> DeleteSmsTemplate(Int64 id)
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        await smsBal.DeleteSmsTemplate(generatorOwnerId, id);
        
        ApiResponse<Object?> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = null,
            Message = successMessages.GetMessage("DeleteSmsTemplate")
        };
        
        return Ok(resp);
    }
    
    [HttpGet("Campaigns")]
    public async Task<ActionResult<ApiResponse<List<SmsCampaign>>>> GetSmsCampaigns()
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        List<SmsCampaign> campaigns = await smsBal.GetSmsCampaigns(generatorOwnerId);
        
        ApiResponse<List<SmsCampaign>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = campaigns,
            Message = successMessages.GetMessage("GetSmsCampaigns")
        };
        
        return Ok(resp);
    }
    
    [HttpPost("Campaigns")]
    public async Task<ActionResult<ApiResponse<SmsCampaign>>> UpsertSmsCampaign(SmsCampaignUpsertRequest request)
    {
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        Int64 createdByUserId = GetCurrentUserId();
        SmsCampaign campaign = await smsBal.UpsertSmsCampaign(generatorOwnerId, request, createdByUserId);
        
        ApiResponse<SmsCampaign> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = campaign,
            Message = successMessages.GetMessage("UpsertSmsCampaign")
        };
        
        return Ok(resp);
    }
    
    [HttpPost("Campaigns/{id}/Send")]
    public async Task<ActionResult<ApiResponse<SmsCampaign>>> SendSmsCampaign(Int64 id)
    {
        SmsCampaign campaign = await smsBal.SendSmsCampaign(id);
        
        ApiResponse<SmsCampaign> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = campaign,
            Message = successMessages.GetMessage("SendSmsCampaign")
        };
        
        return Ok(resp);
    }
    
    [HttpGet("Campaigns/{id}/Messages")]
    public async Task<ActionResult<ApiResponse<List<SmsMessage>>>> GetSmsMessages(Int64 id)
    {
        List<SmsMessage> messages = await smsBal.GetSmsMessages(id);
        
        ApiResponse<List<SmsMessage>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = messages,
            Message = successMessages.GetMessage("GetSmsMessages")
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

