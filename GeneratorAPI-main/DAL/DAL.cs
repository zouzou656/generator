using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using Shared;

namespace DAL;

public class Dal(IOptionsMonitor<AppSettings> appSettings)
{
    public async Task<List<T>> ExecuteSqlQueryMultiRows<T>(String query, DynamicParameters? parameters, CommandType commandType, QueryType queryType)
    {
        IEnumerable<T> resultList;

        using (IDbConnection dbConnection = new SqlConnection(appSettings.CurrentValue.ConnString))
        {
            if (dbConnection.State is ConnectionState.Broken or ConnectionState.Closed)
            {
                dbConnection.Open();
            }

            if (queryType == QueryType.SELECT)
            {
                resultList = await dbConnection.QueryAsync<T>(sql: query, param: parameters, commandType: commandType);
            }
            else
            {
                using IDbTransaction dbTransaction = dbConnection.BeginTransaction();
                try
                {
                    resultList = await dbConnection.QueryAsync<T>(sql: query, param: parameters, commandType: commandType, transaction: dbTransaction);
                    dbTransaction.Commit();
                }
                catch(Exception ex)
                {
                    dbTransaction.Rollback();
                    throw new Exception($"An error occured while executing {query}. Message: {ex.Message}");
                }
            }
            if (dbConnection.State == ConnectionState.Open)
            {
                dbConnection.Close();
            }
        }
        return resultList.ToList();
    }

    public async Task<T?> ExecuteSqlQuerySingleRow<T>(String query, DynamicParameters? parameters, CommandType commandType, QueryType queryType)
    {
        T? result = default;

        using IDbConnection dbConnection = new SqlConnection(appSettings.CurrentValue.ConnString);
        if (dbConnection.State is ConnectionState.Broken or ConnectionState.Closed)
        {
            dbConnection.Open();
        }

        if (queryType == QueryType.SELECT)
        {
            result = await dbConnection.QueryFirstOrDefaultAsync<T>(sql: query, param: parameters, commandType: commandType);
        }
        else
        {
            using IDbTransaction dbTransaction = dbConnection.BeginTransaction();
            try
            {
                result = await dbConnection.QueryFirstOrDefaultAsync<T>(sql: query, param: parameters, commandType: commandType, transaction: dbTransaction);
                dbTransaction.Commit();
            }
            catch(Exception ex)
            {
                dbTransaction.Rollback();
                throw new Exception($"An error occured while executing {query}. Message: {ex.Message}");
            }
        }
        if (dbConnection.State == ConnectionState.Open)
        {
            dbConnection.Close();
        }

        return result;
    }
    
    public async Task<TReturn?> ExecuteSqlQuerySingleRowMap<T1, T2, T3, TReturn>(
        String query,
        Func<T1, T2, T3, TReturn> map,
        DynamicParameters? parameters,
        String splitOn = "Id,Id",
        CommandType commandType = CommandType.StoredProcedure,
        QueryType queryType = QueryType.SELECT)
    {
        TReturn? result = default;

        using IDbConnection dbConnection = new SqlConnection(appSettings.CurrentValue.ConnString);
        if (dbConnection.State is ConnectionState.Broken or ConnectionState.Closed)
        {
            dbConnection.Open();
        }
        
        if (queryType == QueryType.SELECT)
        {
            IEnumerable<TReturn> rows = await dbConnection.QueryAsync(query, map, parameters, commandType: commandType, splitOn: splitOn);
            
            result = rows.FirstOrDefault();
        }
        else
        {
            using IDbTransaction dbTransaction = dbConnection.BeginTransaction();
            try
            {
                IEnumerable<TReturn> rows = await dbConnection.QueryAsync(query, map, parameters, commandType: commandType, splitOn: splitOn);
            
                result = rows.FirstOrDefault();
                
                dbTransaction.Commit();
            }
            catch(Exception ex)
            {
                dbTransaction.Rollback();
                throw new Exception($"An error occured while executing {query}. Message: {ex.Message}");
            }
        }
        if (dbConnection.State == ConnectionState.Open)
        {
            dbConnection.Close();
        }
        return result;
    }
    
    public async Task<TReturn?> ExecuteSqlQuerySingleRowMap<T1, T2, TReturn>(
        String query,
        Func<T1, T2, TReturn> map,
        DynamicParameters? parameters,
        String splitOn = "Id",
        CommandType commandType = CommandType.StoredProcedure,
        QueryType queryType = QueryType.SELECT)
    {
        TReturn? result = default;

        using IDbConnection dbConnection = new SqlConnection(appSettings.CurrentValue.ConnString);
        if (dbConnection.State is ConnectionState.Broken or ConnectionState.Closed)
        {
            dbConnection.Open();
        }
        
        if (queryType == QueryType.SELECT)
        {
            IEnumerable<TReturn> rows = await dbConnection.QueryAsync(query, map, parameters, commandType: commandType, splitOn: splitOn);
            
            result = rows.FirstOrDefault();
        }
        else
        {
            using IDbTransaction dbTransaction = dbConnection.BeginTransaction();
            try
            {
                IEnumerable<TReturn> rows = await dbConnection.QueryAsync(query, map, parameters, commandType: commandType, splitOn: splitOn);
            
                result = rows.FirstOrDefault();
                
                dbTransaction.Commit();
            }
            catch(Exception ex)
            {
                dbTransaction.Rollback();
                throw new Exception($"An error occured while executing {query}. Message: {ex.Message}");
            }
        }
        if (dbConnection.State == ConnectionState.Open)
        {
            dbConnection.Close();
        }
        return result;
    }

    public async Task ExecuteSqlQueryNoReturn(String query, DynamicParameters? parameters, CommandType commandType, QueryType queryType)
    {
        using IDbConnection dbConnection = new SqlConnection(appSettings.CurrentValue.ConnString);
        if (dbConnection.State is ConnectionState.Broken or ConnectionState.Closed)
        {
            dbConnection.Open();
        }

        if (queryType == QueryType.SELECT)
        {
            _ = await dbConnection.QueryAsync(sql: query, param: parameters, commandType: commandType);
        }
        else
        {
            using IDbTransaction dbTransaction = dbConnection.BeginTransaction();
            try
            {
                _ = await dbConnection.QueryAsync(sql: query, param: parameters, commandType: commandType, transaction: dbTransaction);
                dbTransaction.Commit();
            }
            catch(Exception ex)
            {
                dbTransaction.Rollback();
                throw new Exception($"An error occured while executing {query}. Message: {ex.Message}");
            }
        }
        if (dbConnection.State == ConnectionState.Open)
        {
            dbConnection.Close();
        }
    }
    
    public async Task<TReturn?> ExecQueryMultipleAsync<TReturn>(
        String query,
        DynamicParameters? parameters,
        Func<SqlMapper.GridReader, Task<TReturn?>> mapAll,
        CommandType commandType = CommandType.StoredProcedure,
        QueryType queryType = QueryType.SELECT)
    {
        TReturn? result = default;
        
        using IDbConnection dbConnection = new SqlConnection(appSettings.CurrentValue.ConnString);
        if (dbConnection.State is ConnectionState.Broken or ConnectionState.Closed)
        {
            dbConnection.Open();
        }
        
        if (queryType == QueryType.SELECT)
        {
            await using SqlMapper.GridReader grid = await dbConnection.QueryMultipleAsync(query, parameters, commandType: commandType);
            result = await mapAll(grid);
        }
        else
        {
            using IDbTransaction dbTransaction = dbConnection.BeginTransaction();
            try
            {
                await using SqlMapper.GridReader grid = await dbConnection.QueryMultipleAsync(query, parameters, commandType: commandType, transaction: dbTransaction);
                result = await mapAll(grid);
                dbTransaction.Commit();
            }
            catch (Exception ex)
            {
                dbTransaction.Rollback();
                throw new Exception($"An error occured while executing {query}. Message: {ex.Message}");
            }
        }
        
        if (dbConnection.State == ConnectionState.Open)
        {
            dbConnection.Close();
        }
        
        return result;
    }
    
    public async Task<List<T>?> ReadListOrNullAsync<T>(SqlMapper.GridReader g)
    {
        List<T> list = (await g.ReadAsync<T>()).AsList();
        return list.Count == 0 ? null : list;
    }
}

public enum QueryType
{
    SELECT = 0,
    UPDATE = 1,
    DELETE = 2
}