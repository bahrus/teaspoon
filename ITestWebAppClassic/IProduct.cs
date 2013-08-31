using ClassGenMacros;
using System;

namespace TestWebAppClassic
{
    [AugoGenerateTSTypeDefinitionAttribute]
    public interface IProduct
    {
        DateTime Expiry { get; set; }
        string Name { get; set; }
        float Price { get; set; }
        string[] Sizes { get; set; }
    }
}
