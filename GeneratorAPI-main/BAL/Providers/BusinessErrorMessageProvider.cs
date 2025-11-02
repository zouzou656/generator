using Microsoft.Extensions.Options;

namespace BAL.Providers;

public sealed class BusinessErrorMessageProvider
{
    private IReadOnlyDictionary<String,String> _map;

    public BusinessErrorMessageProvider(IOptionsMonitor<List<BusinessErrorMessage>> options)
    {
        _map = BuildMap(options.CurrentValue);

        options.OnChange(list => _map = BuildMap(list));
    }

    private static IReadOnlyDictionary<String, String> BuildMap(List<BusinessErrorMessage>? list)
        => (list ?? []).ToDictionary(x => x.Code, x => x.Message, StringComparer.OrdinalIgnoreCase);

    public String GetMessage(BusinessErrorCode code)
        => _map.GetValueOrDefault(code.ToString(), "Unknown error.");
}