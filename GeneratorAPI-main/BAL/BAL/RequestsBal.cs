using System.Data;
using Dapper;
using DAL;

namespace BAL;

public class RequestsBal(Dal dal)
{
    public async Task<List<GeneratorOwnerRequest>> GetRequests()
    {
        return await dal.ExecuteSqlQueryMultiRows<GeneratorOwnerRequest>(
            "sp_GetGeneratorOwnerRequests",
            null,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<GeneratorOwnerRequest?> GetRequest(Int64 id)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_RequestId", id);
        
        return await dal.ExecuteSqlQuerySingleRow<GeneratorOwnerRequest>(
            "sp_GetGeneratorOwnerRequest",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<GeneratorOwnerRequest> UpdateRequest(Int64 id, RequestUpdateRequest request, Int64 reviewedBy)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_RequestId", id);
        parameters.Add("p_Status", request.Status);
        parameters.Add("p_Notes", request.Notes);
        parameters.Add("p_ReviewedBy", reviewedBy);
        parameters.Add("p_RequestIdOut", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_UpdateGeneratorOwnerRequest",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        Int64 updatedId = parameters.Get<Int64>("p_RequestIdOut");
        return await GetRequest(updatedId) ?? throw new NotFoundException($"Request {id} not found after update.");
    }
}

