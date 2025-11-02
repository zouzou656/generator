using BAL;

namespace GeneratorAPI;

public class ApiResponse<TData>
{
    public required String CorrelationId { get; set; } = String.Empty;
    public required String Message { get; set; } = String.Empty;
    public TData?  Data { get; set; }
}

public record SignInPayload(User User, TokenPair? Token);

public class SuccessMessage
{
    public String Code { get; set; } = String.Empty;
    public String Message { get; set; } = String.Empty;
}