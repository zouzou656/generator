using System.Data;
using Dapper;
using DAL;

namespace BAL;

public class DashboardBal(Dal dal)
{
    public async Task<DashboardDataset> GetOwnerDashboard(Int64 generatorOwnerId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        
        return await dal.ExecQueryMultipleAsync<DashboardDataset>(
            "sp_GetOwnerDashboard",
            parameters,
            async grid =>
            {
                List<DashboardKpis>? kpisList = await dal.ReadListOrNullAsync<DashboardKpis>(grid);
                List<BilledSeriesItem>? billedSeries = await dal.ReadListOrNullAsync<BilledSeriesItem>(grid);
                
                DashboardKpis kpis = kpisList?.FirstOrDefault() ?? new DashboardKpis();
                
                return new DashboardDataset
                {
                    Kpis = kpis,
                    BilledSeries = billedSeries ?? new List<BilledSeriesItem>()
                };
            },
            CommandType.StoredProcedure,
            QueryType.SELECT
        ) ?? new DashboardDataset();
    }
}

public class DashboardKpis
{
    public Int32 Customers { get; set; }
    public Int32 ActiveSubscriptions { get; set; }
    public Int32 PendingBills { get; set; }
    public Int32 SmsSent { get; set; }
}

public class BilledSeriesItem
{
    public String Month { get; set; } = String.Empty;
    public Decimal Total { get; set; }
}

public class DashboardDataset
{
    public DashboardKpis Kpis { get; set; } = new();
    public List<BilledSeriesItem> BilledSeries { get; set; } = new();
}

