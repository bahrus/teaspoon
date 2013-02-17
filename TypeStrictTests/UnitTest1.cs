using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using CurlyBraceParser;
using System.IO;

namespace TypeStrictTests
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void TestMethod1()
        {
            string currDir = System.Environment.CurrentDirectory;
            var dirInfo = new DirectoryInfo(currDir);
            dirInfo = dirInfo.Parent;
            dirInfo = dirInfo.Parent;
            string filePath = dirInfo.FullName + "\\ElX.ts";
            var output = Parser.ParseFile(filePath);
            
            //var output = tsp.
            
            
        }
    }
}
