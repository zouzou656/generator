using System.Net;
using System.Threading.RateLimiting;
using Shared;

namespace GeneratorAPI.Extensions;

public static class RateLimitingExtensions
{
    public static IServiceCollection AddPerIpRateLimiter(
        this IServiceCollection services,
        IConfiguration configuration,
        String policyName)
    {
        RateLimitingConfig config = configuration.GetSection("RateLimiting:PerIpTight")
            .Get<RateLimitingConfig>() ?? new();

        services.AddRateLimiter(options =>
        {
            options.AddPolicy(policyName, httpContext =>
            {
                IPAddress ip = httpContext.Connection.RemoteIpAddress ?? IPAddress.Loopback;

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ip,
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = config.PermitLimit, // API request limit count 
                        Window = TimeSpan.FromMinutes(config.WindowMinutes),  // API request limit cooldown
                        QueueLimit = config.QueueLimit,
                        AutoReplenishment = true
                    });
            });
        });

        return services;
    }
}