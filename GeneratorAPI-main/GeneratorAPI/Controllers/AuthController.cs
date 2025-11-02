using BAL;
using GeneratorAPI.Common;
using GeneratorAPI.Providers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneratorAPI.Controllers;

[ApiController]
[Route("[controller]")]
public class AuthController (ILogger<AuthController> logger, AuthBal authBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpPost]
    [AllowAnonymous]
    [Route("SignIn")]
    public async Task<ActionResult<ApiResponse<SignInPayload>>> SignIn(SignInRequest request)
    {
        // DataGuard check
        if (!ModelState.IsValid)
        {
            throw new ValidationException(GetFirstErrorMsgFromModelState());
        }
        
        // API response
        (User user, TokenPair? tokenPair) =
            await authBal.SignIn(request);
            
        ApiResponse<SignInPayload> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = new SignInPayload(user, tokenPair),
            Message = successMessages.GetMessage(nameof(SignIn))
        };
    
        return Ok(resp);
    }
    
    // Helpers
    [NonAction]
    private String GetFirstErrorMsgFromModelState()
    {
        return ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
            .FirstOrDefault() ?? "Validation exception occured.";
    }
}