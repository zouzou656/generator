namespace BAL;

public abstract class AppException(String code, String message) : Exception(message)
{
    public String Code { get; } = code;
}

public sealed class NotFoundException(String message)
    : AppException("not_found", message);

public sealed class BusinessRuleViolationException(String code, String message) 
    : AppException(code, message);


public sealed class UnauthorizedException (String message) 
    : AppException("not_authorised", message);

// Used for Data Guard
public sealed class ValidationException(String message)
    : AppException("validation_failed", message);