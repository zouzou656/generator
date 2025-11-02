using System.Text.Json;
using BAL;
using GeneratorAPI.Common;
using Microsoft.AspNetCore.Mvc;
using Shared;

namespace GeneratorAPI.Middleware;

public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> log)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleAsync(context, ex);
        }
    }

    private async Task HandleAsync(HttpContext context, Exception ex)
    {
        log.LogError(ex, "Unhandled exception");
        
        String? correlationId = context.Items[HeaderNames.ItemsCorrelationIdKey]?.ToString();
        
        ProblemDetails problem = ex switch
        {
            ValidationException vex => new ProblemDetails()
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "One or more validation errors occurred.",
                Detail = vex.Message,
            },
            NotFoundException nfx => new ProblemDetails
            {
                Status = StatusCodes.Status404NotFound,
                Title  = "Not Found.",
                Detail = nfx.Message
            },
            BusinessRuleViolationException brx => new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title  = $"Business Rule Violation: {brx.Code}",
                Detail = brx.Message
            },
            UnauthorizedException uax => new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title  = "Unauthorized.",
                Detail = uax.Message
            },
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title  = "Server error occurred.",
                Detail = ex.Message
            }
        };

        // metadata
        if (!String.IsNullOrWhiteSpace(correlationId))
            problem.Extensions[Utils.ToCameCase(HeaderNames.ItemsCorrelationIdKey)] = correlationId;
        
        context.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        
        await context.Response.WriteAsync(
            JsonSerializer.Serialize(problem, problem.GetType()));
    }
}