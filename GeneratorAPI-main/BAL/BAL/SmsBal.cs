using System.Data;
using Dapper;
using DAL;

namespace BAL;

public class SmsBal(Dal dal)
{
    // Templates (Note: Templates might be stored separately or in a different table)
    // For now, we'll assume there's a table or they're stored as part of campaigns
    public async Task<List<SmsTemplateRecord>> GetSmsTemplates(Int64 generatorOwnerId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        
        return await dal.ExecuteSqlQueryMultiRows<SmsTemplateRecord>(
            "sp_GetSmsTemplates",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<SmsTemplateRecord> UpsertSmsTemplate(Int64 generatorOwnerId, SmsTemplateUpsertRequest request)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_TemplateId", request.Id);
        parameters.Add("p_Name", request.Name);
        parameters.Add("p_Body", request.Body);
        parameters.Add("p_TemplateIdOut", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_UpsertSmsTemplate",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        Int64 templateId = parameters.Get<Int64>("p_TemplateIdOut");
        return await GetSmsTemplate(templateId) ?? throw new NotFoundException($"SmsTemplate {templateId} not found after upsert.");
    }
    
    public async Task<SmsTemplateRecord?> GetSmsTemplate(Int64 templateId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_TemplateId", templateId);
        
        return await dal.ExecuteSqlQuerySingleRow<SmsTemplateRecord>(
            "sp_GetSmsTemplate",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task DeleteSmsTemplate(Int64 generatorOwnerId, Int64 templateId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_TemplateId", templateId);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_DeleteSmsTemplate",
            parameters,
            CommandType.StoredProcedure,
            QueryType.DELETE
        );
    }
    
    // Campaigns
    public async Task<List<SmsCampaign>> GetSmsCampaigns(Int64 generatorOwnerId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        
        return await dal.ExecuteSqlQueryMultiRows<SmsCampaign>(
            "sp_GetSmsCampaigns",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<SmsCampaign> UpsertSmsCampaign(Int64 generatorOwnerId, SmsCampaignUpsertRequest request, Int64 createdByUserId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_GeneratorOwnerId", generatorOwnerId);
        parameters.Add("p_CampaignId", request.Id);
        parameters.Add("p_Title", request.Title);
        parameters.Add("p_MessageBody", request.MessageBody);
        parameters.Add("p_RelatedPeriodYear", request.RelatedPeriodYear);
        parameters.Add("p_RelatedPeriodMonth", request.RelatedPeriodMonth);
        parameters.Add("p_CreatedByUserId", createdByUserId);
        parameters.Add("p_CampaignIdOut", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_UpsertSmsCampaign",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        Int64 campaignId = parameters.Get<Int64>("p_CampaignIdOut");
        return await GetSmsCampaign(campaignId) ?? throw new NotFoundException($"SmsCampaign {campaignId} not found after upsert.");
    }
    
    public async Task<SmsCampaign?> GetSmsCampaign(Int64 campaignId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_CampaignId", campaignId);
        
        return await dal.ExecuteSqlQuerySingleRow<SmsCampaign>(
            "sp_GetSmsCampaign",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
    
    public async Task<SmsCampaign> SendSmsCampaign(Int64 campaignId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_CampaignId", campaignId);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_SendSmsCampaign",
            parameters,
            CommandType.StoredProcedure,
            QueryType.UPDATE
        );
        
        return await GetSmsCampaign(campaignId) ?? throw new NotFoundException($"SmsCampaign {campaignId} not found after send.");
    }
    
    public async Task<List<SmsMessage>> GetSmsMessages(Int64 campaignId)
    {
        DynamicParameters parameters = new();
        parameters.Add("p_CampaignId", campaignId);
        
        return await dal.ExecuteSqlQueryMultiRows<SmsMessage>(
            "sp_GetSmsMessages",
            parameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
}

// Template record (may be different from campaign)
public class SmsTemplateRecord
{
    public Int64 Id { get; set; }
    public Int64 GeneratorOwnerId { get; set; }
    public String Name { get; set; } = String.Empty;
    public String Body { get; set; } = String.Empty;
    public DateTime UpdatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

