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
public class ImportBatchesController(ILogger<ImportBatchesController> logger, ImportBatchesBal importBatchesBal, SuccessMessageProvider successMessages) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ImportBatch>>>> GetImportBatches()
    {
        Int64 generatorOwnerId = GetCurrentGeneratorOwnerId();
        List<ImportBatch> batches = await importBatchesBal.GetImportBatches(generatorOwnerId);
        
        ApiResponse<List<ImportBatch>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = batches,
            Message = successMessages.GetMessage("GetImportBatches")
        };
        
        return Ok(resp);
    }
    
    [HttpGet("{id}/Rows")]
    public async Task<ActionResult<ApiResponse<List<ImportBatchRow>>>> GetImportBatchRows(Int64 id)
    {
        List<ImportBatchRow> rows = await importBatchesBal.GetImportBatchRows(id);
        
        ApiResponse<List<ImportBatchRow>> resp = new()
        {
            CorrelationId = HttpContext.Items[HeaderNames.ItemsCorrelationIdKey]!.ToString()!,
            Data = rows,
            Message = successMessages.GetMessage("GetImportBatchRows")
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

