using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TestWebAppClassic.ModelTests
{
    public class ModelTest1
    {

        public ModelTest1()
        {
            this.StringValue = "Hello, World";
            this.StringValue2 = "goodbye";
        }

        public static ModelTest1 GetModel()
        {
            return new ModelTest1();
        }

        public static ModelTest1 Filter(ModelTest1 mta)
        {
            mta.StringValue2 = null;
            return mta;
        }

        public string StringValue { get; set; }

        public string StringValue2 { get; set; }
    }
}