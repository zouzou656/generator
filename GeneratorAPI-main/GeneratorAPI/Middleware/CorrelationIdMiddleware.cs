using GeneratorAPI.Common;

namespace GeneratorAPI.Middleware;

public class CorrelationIdMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        String correlationId = context.Request.Headers[HeaderNames.CorrelationId].FirstOrDefault() ?? Guid.NewGuid().ToString();

        context.Items[HeaderNames.ItemsCorrelationIdKey] = correlationId;
        context.Response.Headers[HeaderNames.CorrelationId] = correlationId;

        using (Serilog.Context.LogContext.PushProperty(HeaderNames.ItemsCorrelationIdKey, correlationId))
        {
            await next(context);
        }
    }
}