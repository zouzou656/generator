using System.Data;
using System.Text.Json;
using Dapper;
using DAL;

namespace BAL;

public class OwnerCustomersBal(Dal dal)
{
    public async Task<List<OwnerCustomer>> GetOwnerCustomers(Int64 generatorOwnerId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        
        return await dal.ExecuteSqlQueryMultiRows<OwnerCustomer>(
            "sp_GetOwnerCustomers",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<OwnerCustomer> UpsertOwnerCustomer(Int64 generatorOwnerId, CustomerUpsertRequest request)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_OwnerCustomerId", request.Id);
        parameters.Add("p_PhoneNumber", request.PhoneNumber);
        parameters.Add("p_FirstName", request.FirstName);
        parameters.Add("p_LastName", request.LastName);
        parameters.Add("p_SubscriptionNumber", request.SubscriptionNumber);
        parameters.Add("p_Zone", request.Zone);
        parameters.Add("p_Address", request.Address);
        parameters.Add("p_SubscriptionAmps", request.SubscriptionAmps);
        parameters.Add("p_BillingMode", request.BillingMode);
        parameters.Add("p_DefaultNameOnBill", request.DefaultNameOnBill);
        parameters.Add("p_IsActive", request.IsActive);
        parameters.Add("p_OwnerCustomerIdOut", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_UpsertOwnerCustomer",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        Int64 ownerCustomerId = parameters.Get<Int64>("p_OwnerCustomerIdOut");
        return await GetOwnerCustomer(ownerCustomerId) ?? throw new NotFoundException($"OwnerCustomer {ownerCustomerId} not found after upsert.");
    }
    
    public async Task<OwnerCustomer?> GetOwnerCustomer(Int64 ownerCustomerId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_OwnerCustomerId", ownerCustomerId);
        
        return await dal.ExecuteSqlQuerySingleRow<OwnerCustomer>(
            "sp_GetOwnerCustomer",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<Boolean> CheckCustomerUnique(Int64 generatorOwnerId, String? phoneNumber, String? subscriptionNumber)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_PhoneNumber", phoneNumber);
        parameters.Add("p_SubscriptionNumber", subscriptionNumber);
        parameters.Add("p_IsUnique", dbType: DbType.Boolean, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_CheckCustomerUnique",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
        
        return parameters.Get<Boolean>("p_IsUnique");
    }
    
    public async Task<ImportBatch> ImportCustomers(Int64 generatorOwnerId, CustomerImportRequest request, Int64 createdByUserId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_ImportType", "CUSTOMER");
        parameters.Add("p_OriginalFilename", request.OriginalFilename);
        parameters.Add("p_CreatedByUserId", createdByUserId);
        
        String rowsJson = JsonSerializer.Serialize(request.Rows);
        parameters.Add("p_RowsJson", rowsJson);
        parameters.Add("p_ImportBatchId", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_ImportCustomers",
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

