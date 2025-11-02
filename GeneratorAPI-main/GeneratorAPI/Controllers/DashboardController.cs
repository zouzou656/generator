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
public class DashboardController(ILogger<DashboardController> logger, DashboardBal dashboardBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<DashboardDataset>>> GetOwnerDashboard()
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        DashboardDataset dataset = await dashboardBal.GetOwnerDashboard(generatorOwnerId);
        
        ApiResponse<DashboardDataset> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = dataset,
            Message = successMessages.GetMessage("GetOwnerDashboard")
        };
        
        return Ok(resp);
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
}

