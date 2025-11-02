using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace BAL;

public sealed class JwtIssuer(IConfiguration cfg)
{
    public String CreateAccessToken(Int64 userId, String email, IEnumerable<String> roles, Int64? generatorOwnerId, out String jti)
    {
        String? issuer = cfg["Jwt:Issuer"];
        String? audience = cfg["Jwt:Audience"];
        String key = cfg["Jwt:Key"]!;
        Int32 minutes = Int32.Parse(cfg["Jwt:AccessTokenMinutes"] ?? "15");

        jti = Guid.NewGuid().ToString();

        List<Claim> claims =
        [
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, jti),
            new(ClaimTypes.NameIdentifier, userId.ToString())
        ];

        // roles → one claim per role
        claims.AddRange(roles.Distinct(StringComparer.OrdinalIgnoreCase).Select(r => new Claim(ClaimTypes.Role, r)));
        
        // Add GeneratorOwnerId if present
        if (generatorOwnerId.HasValue)
        {
            claims.Add(new Claim("GeneratorOwnerId", generatorOwnerId.Value.ToString()));
        }

        SigningCredentials creds = new (
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        JwtSecurityToken token = new (
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public (String Raw, Byte[] Hash) CreateRefreshToken(Int32 bytes = 32)
    {
        // raw token the client will keep (base64url) + SHA-256 hash to store
        Byte[] rawBytes = RandomNumberGenerator.GetBytes(bytes);
        String? raw = Base64UrlEncoder.Encode(rawBytes);
        Byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
        return (raw, hash);
    }
}