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
            var outp = assemblyList.ToDefaultImplClasses();
            foreach (var outi in outp)
            {
                string filePath = currentDir + "\\" + outi.Key.SubstringBefore(",") + ".defaultImpl.cs";
                var fi = new FileInfo(filePath);
                if (fi.Exists)
                {
                    var rs = fi.OpenText();
                    string content = rs.ReadToEnd();
                    rs.Close();
                    if (content == outi.Value) continue;
                }
                fi.Delete();
                using (var sw = new StreamWriter(filePath))
                {
                    sw.Write(outi.Value);
                    sw.Close();
                }
            }
            //foreach (var implClass in defaultImplCasses)
            //    {
            //        string filePath = d + "\\" + implClass.Key + ".defaultImpl.cs";
            //        var fi = new FileInfo(filePath);
            //        if (fi.Exists)
            //        {
            //            var rs = fi.OpenText();
            //            string content = rs.ReadToEnd();
            //            rs.Close();
            //            if (content == implClass.Value) continue;
            //        }
            //        fi.Delete();
            //        using (var sw = new StreamWriter(filePath))
            //        {
            //            sw.Write(implClass.Value);
            //            sw.Close();
            //        }
            //}
        }
    }
}
