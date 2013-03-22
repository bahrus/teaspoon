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
            var defaultImplClasses = assemblyList.ProcessAssemblies();
            //foreach (var outi in defaultImplClasses)
            //{
            //    string filePath = currentDir + "\\" + outi.Key.SubstringBefore(",") + ".defaultImpl.cs";
            //    var fi = new FileInfo(filePath);
            //    if (fi.Exists)
            //    {
            //        var rs = fi.OpenText();
            //        string content = rs.ReadToEnd();
            //        rs.Close();
            //        if (content == outi.Value) continue;
            //    }
            //    fi.Delete();
            //    using (var sw = new StreamWriter(filePath))
            //    {
            //        sw.Write(outi.Value);
            //        sw.Close();
            //    }
            //}
            #endregion
            //#region Interface Implementation Classes
            //var implementingClasses = assemblyList.ImplementingInterfacePartialClasses();
            //foreach (var outi in implementingClasses)
            //{
            //    string filePath = currentDir + "\\" + outi.Key.SubstringBefore(",") + ".implementingClasses.cs";
            //    var fi = new FileInfo(filePath);
            //    if (fi.Exists)
            //    {
            //        var rs = fi.OpenText();
            //        string content = rs.ReadToEnd();
            //        rs.Close();
            //        if (content == outi.Value) continue;
            //    }
            //    fi.Delete();
            //    using (var sw = new StreamWriter(filePath))
            //    {
            //        sw.Write(outi.Value);
            //        sw.Close();
            //    }
            //}
            //#endregion
        }
    }
}
