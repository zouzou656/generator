using System.Data;
using System.Text.Json;
using Dapper;
using DAL;

namespace BAL;

public class BillsBal(Dal dal)
{
    public async Task<List<Bill>> GetBills(Int64 generatorOwnerId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        
        return await dal.ExecuteSqlQueryMultiRows<Bill>(
            "sp_GetBills",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<Bill> CreateBill(Int64 generatorOwnerId, BillCreateRequest request)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_OwnerCustomerId", request.OwnerCustomerId);
        parameters.Add("p_BillDate", request.BillDate);
        parameters.Add("p_PeriodYear", request.PeriodYear);
        parameters.Add("p_PeriodMonth", request.PeriodMonth);
        parameters.Add("p_PreviousKva", request.PreviousKva);
        parameters.Add("p_CurrentKva", request.CurrentKva);
        parameters.Add("p_SubscriptionFeeVar", request.SubscriptionFeeVar);
        parameters.Add("p_SubscriptionFeeFixed", request.SubscriptionFeeFixed);
        parameters.Add("p_TotalAmount", request.TotalAmount);
        parameters.Add("p_AmountUSD", request.AmountUSD);
        parameters.Add("p_AmountLBP", request.AmountLBP);
        parameters.Add("p_NameOnBill", request.NameOnBill);
        parameters.Add("p_DueDate", request.DueDate);
        parameters.Add("p_Notes", request.Notes);
        parameters.Add("p_SubscriptionAmps", request.SubscriptionAmps);
        parameters.Add("p_BillId", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_CreateBill",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        Int64 billId = parameters.Get<Int64>("p_BillId");
        return await GetBill(billId) ?? throw new NotFoundException($"Bill {billId} not found after creation.");
    }
    
    public async Task<Bill> UpdateBill(Int64 billId, Int64 generatorOwnerId, BillUpdateRequest request)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_BillId", billId);
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_BillDate", request.BillDate);
        parameters.Add("p_PeriodYear", request.PeriodYear);
        parameters.Add("p_PeriodMonth", request.PeriodMonth);
        parameters.Add("p_PreviousKva", request.PreviousKva);
        parameters.Add("p_CurrentKva", request.CurrentKva);
        parameters.Add("p_SubscriptionFeeVar", request.SubscriptionFeeVar);
        parameters.Add("p_SubscriptionFeeFixed", request.SubscriptionFeeFixed);
        parameters.Add("p_TotalAmount", request.TotalAmount);
        parameters.Add("p_AmountUSD", request.AmountUSD);
        parameters.Add("p_AmountLBP", request.AmountLBP);
        parameters.Add("p_NameOnBill", request.NameOnBill);
        parameters.Add("p_DueDate", request.DueDate);
        parameters.Add("p_Notes", request.Notes);
        parameters.Add("p_SubscriptionAmps", request.SubscriptionAmps);
        parameters.Add("p_Status", request.Status);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_UpdateBill",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        return await GetBill(billId) ?? throw new NotFoundException($"Bill {billId} not found after update.");
    }
    
    public async Task<Bill?> GetBill(Int64 billId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_BillId", billId);
        
        return await dal.ExecuteSqlQuerySingleRow<Bill>(
            "sp_GetBill",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<ImportBatch> ImportBills(Int64 generatorOwnerId, BillImportRequest request, Int64 createdByUserId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_ImportType", "BILL");
        parameters.Add("p_OriginalFilename", request.OriginalFilename);
        parameters.Add("p_CreatedByUserId", createdByUserId);
        
        String rowsJson = JsonSerializer.Serialize(request.Rows);
        parameters.Add("p_RowsJson", rowsJson);
        parameters.Add("p_ImportBatchId", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_ImportBills",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        Int64 batchId = parameters.Get<Int64>("p_ImportBatchId");
        return await GetImportBatch(batchId) ?? throw new NotFoundException($"ImportBatch {batchId} not found after creation.");
    }
    
    private async Task<ImportBatch?> GetImportBatch(Int64 batchId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_ImportBatchId", batchId);
        
        return await dal.ExecuteSqlQuerySingleRow<ImportBatch>(
            "sp_GetImportBatch",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
}

