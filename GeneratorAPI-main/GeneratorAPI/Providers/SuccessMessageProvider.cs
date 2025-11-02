using Microsoft.Extensions.Options;

namespace GeneratorAPI.Providers;

public class SuccessMessageProvider
{
    private IReadOnlyDictionary<String,String> _map;

    public SuccessMessageProvider(IOptionsMonitor<List<SuccessMessage>> options)
    {
        _map = BuildMap(options.CurrentValue);

        options.OnChange(list => _map = BuildMap(list));
    }

    private static IReadOnlyDictionary<String, String> BuildMap(List<SuccessMessage>? list)
        => (list ?? []).ToDictionary(x => x.Code, x => x.Message, StringComparer.OrdinalIgnoreCase);

    public String GetMessage(String code)
        => _map.GetValueOrDefault(code, "Success.");
}