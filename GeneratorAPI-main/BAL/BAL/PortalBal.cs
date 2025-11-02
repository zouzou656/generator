using System.Data;
using Dapper;
using DAL;

namespace BAL;

public class PortalBal(Dal dal)
{
    public async Task<CheckBillResult> GetBillsByPhone(String phoneNumber, String? subscriptionNumber)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_PhoneNumber", phoneNumber);
        parameters.Add("p_SubscriptionNumber", subscriptionNumber);
        
        return await dal.ExecQueryMultipleAsync<CheckBillResult>(
            "sp_GetBillsByPhone",
            parameters,
            async grid =>
            {
                List<Bill>? pending = await dal.ReadListOrNullAsync<Bill>(grid);
                List<Bill>? paid = await dal.ReadListOrNullAsync<Bill>(grid);
                
                return new CheckBillResult
                {
                    Pending = pending ?? new List<Bill>(),
                    Paid = paid ?? new List<Bill>()
                };
            },
            CommandType.StoredProcedure,
            QueryType.SELECT
        ) ?? new CheckBillResult();
    }
    
    public async Task<List<Bill>> GetBillsBySubscriptionNumber(String subscriptionNumber)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_SubscriptionNumber", subscriptionNumber);
        
        return await dal.ExecuteSqlQueryMultiRows<Bill>(
            "sp_GetBillsBySubscriptionNumber",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<List<Bill>> GetAllBills()
    {
        return await dal.ExecuteSqlQueryMultiRows<Bill>(
            "sp_GetAllBills",
            null,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
}

public class CheckBillResult
{
    public List<Bill> Pending { get; set; } = new();
    public List<Bill> Paid { get; set; } = new();
}

