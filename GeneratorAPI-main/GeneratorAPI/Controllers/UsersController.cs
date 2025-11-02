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
public class UsersController(ILogger<UsersController> logger, UsersBal usersBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ApiResponse<List<User>>>> GetUsers()
    {
        List<User> users = await usersBal.GetUsers();
        
        ApiResponse<List<User>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = users,
            Message = successMessages.GetMessage("GetUsers")
        };
        
        return Ok(resp);
    }
}

