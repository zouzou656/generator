namespace BAL;

public class BusinessErrorMessage
{
    public String Code { get; set; } = String.Empty;
    public String Message { get; set; } = String.Empty;
}

public class TokenPair
{
    public String AccessToken { get; set; } = String.Empty;
    public String RefreshToken { get; set; } = String.Empty;
}