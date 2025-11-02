using System.Data;
using Dapper;
using DAL;

namespace BAL;

public class UsersBal(Dal dal)
{
    public async Task<List<User>> GetUsers()
    {
        return await dal.ExecuteSqlQueryMultiRows<User>(
            "sp_GetUsers",
            null,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
    }
}

