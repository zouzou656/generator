using System.Data;
using Dapper;
using DAL;
using Shared;

namespace BAL;

public class AuthBal(Dal dal, JwtIssuer jwtIssuer)
{
    public async Task<(User, TokenPair?)> SignIn(SignInRequest request)
    {
        String passwordHash = Utils.ComputeSha256Hash(request.Password);
        
        DynamicParameters signInParameters = new();
        signInParameters.Add("p_Email", request.Email);
        signInParameters.Add("p_PasswordHash", passwordHash);
        signInParameters.Add("p_UserId", dbType: DbType.Int64, direction: ParameterDirection.Output);
        signInParameters.Add("p_Username", dbType: DbType.String, size: 100, direction: ParameterDirection.Output);
        signInParameters.Add("p_FullName", dbType: DbType.String, size: 150, direction: ParameterDirection.Output);
        signInParameters.Add("p_PhoneNumber", dbType: DbType.String, size: 30, direction: ParameterDirection.Output);
        signInParameters.Add("p_Role", dbType: DbType.String, size: 30, direction: ParameterDirection.Output);
        signInParameters.Add("p_IsActive", dbType: DbType.Boolean, direction: ParameterDirection.Output);
        signInParameters.Add("p_GeneratorOwnerId", dbType: DbType.Int64, direction: ParameterDirection.Output);
        
        await dal.ExecuteSqlQueryNoReturn(
            "sp_UserSignIn",
            signInParameters,
            CommandType.StoredProcedure,
            QueryType.SELECT
        );
        
        Int64? userId = signInParameters.Get<Int64?>("p_UserId");
        if (userId == null || userId == 0)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }
        
        Boolean isActive = signInParameters.Get<Boolean>("p_IsActive");
        if (!isActive)
        {
            throw new UnauthorizedException("Your account is inactive. Please contact an administrator.");
        }
        
        String role = signInParameters.Get<String>("p_Role") ?? String.Empty;
        
        User user = new()
        {
            Id = userId.Value,
            Username = signInParameters.Get<String>("p_Username") ?? String.Empty,
            Email = request.Email,
            FullName = signInParameters.Get<String>("p_FullName") ?? String.Empty,
            PhoneNumber = signInParameters.Get<String>("p_PhoneNumber") ?? String.Empty,
            Role = role,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            GeneratorOwnerId = signInParameters.Get<Int64?>("p_GeneratorOwnerId")
        };
        
        String accessToken = jwtIssuer.CreateAccessToken(
            user.Id,
            user.Email,
            [role],
            user.GeneratorOwnerId,
            out String jti
        );
        
        (String refreshTokenRaw, Byte[] refreshTokenHash) = jwtIssuer.CreateRefreshToken();
        
        // Store refresh token hash in DB (simplified - in production you'd have a RefreshToken table)
        // For now, we'll just return the raw token
        
        TokenPair tokenPair = new()
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenRaw
        };
        
        return (user, tokenPair);
    }
}