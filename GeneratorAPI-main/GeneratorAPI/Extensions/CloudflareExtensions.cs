using Microsoft.AspNetCore.HttpOverrides;

namespace GeneratorAPI.Extensions;

public static class CloudflareExtensions
{
    public static WebApplication UseCloudflareForwarding(this WebApplication app)
    {
        app.UseForwardedHeaders(new ForwardedHeadersOptions
        {
            ForwardedHeaders = ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedFor,
            ForwardLimit = 1,
            ForwardedForHeaderName = "CF-Connecting-IP"
            // Optional hardening:
            // KnownProxies = { IPAddress.Parse("203.0.113.1") },
            // KnownNetworks = { new IPNetwork(IPAddress.Parse("173.245.48.0"), 20) } // Cloudflare ranges
        });

        return app;
    }
}