using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestWebAppClassic
{
    public static class ProductManager
    {
        public static Product RetrieveProduct()
        {
            var product = new Product
            {
                Name = "Apple",
                Expiry = new DateTime(2008, 12, 28),
                Price = 3.99f,
                Sizes = new string[] { "Small", "Medium", "Large" },
            };
            return product;

        }
    }

    public class Product
    {
        public string Name { get; set; }
        public DateTime Expiry { get; set; }
        public float Price { get; set; }
        public string[] Sizes { get; set; }
    }
}