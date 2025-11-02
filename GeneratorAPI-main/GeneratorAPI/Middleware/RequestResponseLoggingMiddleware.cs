using System.Text;
using System.Text.Json;

namespace GeneratorAPI.Middleware;

public class RequestResponseLoggingMiddleware(RequestDelegate next, ILogger<RequestResponseLoggingMiddleware> logger)
{
    private readonly JsonSerializerOptions _prettyOptions = new() { WriteIndented = true };

    public async Task Invoke(HttpContext context)
    {
        // --- Request ---
        context.Request.EnableBuffering();
        String requestBody = String.Empty;

        if (context.Request.ContentLength > 0 &&
            context.Request.ContentType != null &&
            context.Request.ContentType.Contains("application/json", StringComparison.OrdinalIgnoreCase))
        {
            using StreamReader? reader = new StreamReader(context.Request.Body, Encoding.UTF8, leaveOpen: true);
            String? rawRequest = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;

            requestBody = PrettyPrintJsonIfPossible(rawRequest);
        }

        logger.LogInformation("========== [START REQUEST] ==========");
        logger.LogInformation(
            "Incoming request {Method} {Path}{Query} | \nRequest Body: {RequestBody}",
            context.Request.Method, 
            context.Request.Path, 
            context.Request.QueryString.HasValue ? context.Request.QueryString.Value : "", 
            Truncate(requestBody, 2000));

        // --- Response ---
        Stream? originalBodyStream = context.Response.Body;
        await using MemoryStream? responseBody = new MemoryStream();
        context.Response.Body = responseBody;

        try
        {
            await next(context);

            context.Response.Body.Seek(0, SeekOrigin.Begin);
            String responseText;

            if (context.Response.ContentType != null &&
                context.Response.ContentType.Contains("json", StringComparison.OrdinalIgnoreCase))
            {
                using StreamReader? reader = new StreamReader(context.Response.Body, Encoding.UTF8, leaveOpen: true);
                String? rawResponse = await reader.ReadToEndAsync();
                context.Response.Body.Position = 0;
                responseText = PrettyPrintJsonIfPossible(rawResponse);
            }
            else
            {
                // fallback: read raw text if small-ish (could skip binary)
                context.Response.Body.Seek(0, SeekOrigin.Begin);
                using StreamReader? reader = new StreamReader(context.Response.Body, Encoding.UTF8, leaveOpen: true);
                responseText = await reader.ReadToEndAsync();
                context.Response.Body.Position = 0;
            }

            logger.LogInformation(
                "Outgoing response {StatusCode} {Path} | \nResponse Body: {ResponseBody}",
                context.Response.StatusCode, 
                context.Request.Path, 
                Truncate(responseText, 2000));
            logger.LogInformation("========== [END REQUEST] ==========");

            await responseBody.CopyToAsync(originalBodyStream);
        }
        finally
        {
            // ensure the original body is restored if something throws
            context.Response.Body = originalBodyStream;
        }
    }

    private String PrettyPrintJsonIfPossible(String raw)
    {
        if (String.IsNullOrWhiteSpace(raw))
            return String.Empty;

        try
        {
            using JsonDocument? doc = JsonDocument.Parse(raw);
            return JsonSerializer.Serialize(doc.RootElement, _prettyOptions);
        }
        catch
        {
            // not valid JSON, return original
            return raw;
        }
    }

    private String Truncate(String value, Int32 maxLength)
    {
        if (String.IsNullOrEmpty(value)) return value;
        return value.Length <= maxLength ? value : value[..maxLength] + "...(truncated)";
    }
}