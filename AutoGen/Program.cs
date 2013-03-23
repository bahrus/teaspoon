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

            var assemblyList = files.Select(file => Assembly.LoadFile(file.FullName)).ToList();

            var processedAssemblies = assemblyList.ProcessAssemblies();

            foreach (var procOutput in processedAssemblies)
            {
                string filePath = dirIno.FullName + "\\" + procOutput.FileName;
                var fi = new FileInfo(filePath);
                if (fi.Exists)
                {
                    var rs = fi.OpenText();
                    string content = rs.ReadToEnd();
                    rs.Close();
                    if (content == procOutput.FileContent) continue;
                }
                fi.Delete();
                using (var sw = new StreamWriter(filePath))
                {
                    sw.Write(procOutput.FileContent);
                    sw.Close();
                }
            }
            
        }
    }
}
