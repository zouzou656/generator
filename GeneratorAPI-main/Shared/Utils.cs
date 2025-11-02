using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Shared;

public static class Utils
{
    public static String ComputeSha256Hash(string rawString)
    {
        // Create a SHA256 hash algorithm instance.
        using SHA256 sha256Hash = SHA256.Create();
        // ComputeHash returns a byte array.
        Byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawString));

        // Convert byte array to a hexadecimal string.
        StringBuilder builder = new StringBuilder();
        foreach (Byte t in bytes)
        {
            builder.Append(t.ToString("x2"));
        }
        return builder.ToString();
    }
    
    public static String ToCameCase(String word)
    {
        return Char.ToLowerInvariant(word[0]) + word.Substring(1);
    }
}

public sealed class DateOnlyDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader r, Type t, JsonSerializerOptions o)
        => DateTime.Parse(r.GetString()!);

    public override void Write(Utf8JsonWriter w, DateTime value, JsonSerializerOptions o)
        => w.WriteStringValue(value.ToString("yyyy-MM-dd"));
}