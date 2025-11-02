namespace Shared;

public sealed class RateLimitingConfig
{
    public Int32 PermitLimit { get; set; } = 60;
    public Int32 WindowMinutes { get; set; } = 1;
    public Int32 QueueLimit { get; set; }
}