using BAL;
using BAL.Providers;
using DAL;
using GeneratorAPI;
using GeneratorAPI.Extensions;
using GeneratorAPI.Middleware;
using GeneratorAPI.Providers;
using Microsoft.OpenApi.Models;
using Serilog;
using Shared;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

IWebHostEnvironment env = builder.Environment;

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Logging
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// MVC supress Bad Request error without entering in the controller
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(o => o.SuppressModelStateInvalidFilter = true)
    .AddJsonOptions(options =>
    {
        // Use camelCase for JSON property names to match frontend expectations
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    });

builder.Services.AddEndpointsApiExplorer();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddJwtAuth(builder.Configuration); // your extension
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "GeneratorAPI", Version = "v1" });

    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };

    c.AddSecurityDefinition("Bearer", jwtScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });
});

// Rate Limiting per IP
builder.Services.AddPerIpRateLimiter(builder.Configuration, "PerIpTight"); // registers "PerIpTight"

// DI
builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
builder.Services.Configure<List<BusinessErrorMessage>>(builder.Configuration.GetSection("BusinessErrorMessages"));
builder.Services.AddSingleton<BusinessErrorMessageProvider>();
builder.Services.Configure<List<SuccessMessage>>(builder.Configuration.GetSection("SuccessMessages"));
builder.Services.AddSingleton<SuccessMessageProvider>();
// BAL services
builder.Services.AddScoped<AuthBal>();
builder.Services.AddScoped<RequestsBal>();
builder.Services.AddScoped<UsersBal>();
builder.Services.AddScoped<OwnerCustomersBal>();
builder.Services.AddScoped<BillsBal>();
builder.Services.AddScoped<ImportBatchesBal>();
builder.Services.AddScoped<SmsBal>();
builder.Services.AddScoped<DashboardBal>();
builder.Services.AddScoped<PortalBal>();

// DAL services
builder.Services.AddScoped<Dal>();

Boolean isSwaggerEnabled = builder.Configuration.GetValue<Boolean>("AppSettings:IsSwaggerEnabled");

WebApplication app = builder.Build();

// Dev docs
if (isSwaggerEnabled)
{
    app.UseSwagger();
    app.UseSwaggerUI(o =>
    {
        o.SwaggerEndpoint("/swagger/v1/swagger.json", "GeneratorAPI v1");
    });
}

// Get the client real IP address since Cloud Flare is the proxy.
app.UseCloudflareForwarding();

// CORS must be before UseHttpsRedirection
app.UseCors();

app.UseHttpsRedirection();

// Middlewares
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<RequestResponseLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Auth
app.UseAuthPipeline();

// Rate Limiting per client IP
app.UseRateLimiter();

app.MapControllers()
   .RequireRateLimiting("PerIpTight");

// robots.txt
app.MapGet("/robots.txt", () =>
    Results.Text("User-agent: *\nDisallow: /\n", "text/plain"));
    
app.Run();