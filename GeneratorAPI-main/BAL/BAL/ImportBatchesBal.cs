using System.Data;
using Dapper;
using DAL;

namespace BAL;

public class ImportBatchesBal(Dal dal)
{
    public async Task<List<ImportBatch>> GetImportBatches(Int64 generatorOwnerId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        
        return await dal.ExecuteSqlQueryMultiRows<ImportBatch>(
            "sp_GetImportBatches",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<List<ImportBatchRow>> GetImportBatchRows(Int64 importBatchId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_ImportBatchId", importBatchId);
        
        return await dal.ExecuteSqlQueryMultiRows<ImportBatchRow>(
            "sp_GetImportBatchRows",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
}

