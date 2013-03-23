using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using CurlyBraceParser.CSharp;
using CurlyBraceParser;

namespace AutoGen
{
    class Program
    {
        static void Main(string[] args)
        {
            var currentDir = args.Length > 0 ? args[0] : System.Environment.CurrentDirectory;
            var dirIno = new DirectoryInfo(currentDir);
            var files = dirIno.GetFiles("*.dll");
            var assemblyList = new List<Assembly>();
            foreach (var file in files)
            {
                var fileAssembly = Assembly.LoadFile(file.FullName);
                assemblyList.Add(fileAssembly);
            }
            #region Default Impl Classes
            var processedAssemblies = assemblyList.ProcessAssemblies();
            
            #endregion
            
        }
    }
}
