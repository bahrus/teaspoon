using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using ClassGenMacros;

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
            var fileGroupings = processedAssemblies.GroupBy(apo => apo.FileName);
            foreach (var fileGrouping in fileGroupings)
            {
                var sb = new StringBuilder();
                foreach (var apo in fileGrouping)
                {
                    sb.AppendLine(apo.FileContent);
                }
                string SrcContent = sb.ToString();
                string filePath = dirIno.FullName + "\\" + fileGrouping.Key;
                var fi = new FileInfo(filePath);
                if (fi.Exists)
                {
                    var rs = fi.OpenText();
                    string content = rs.ReadToEnd();
                    rs.Close();
                    if (content == SrcContent) continue;
                }
                fi.Delete();
                using (var sw = new StreamWriter(filePath))
                {
                    sw.Write(SrcContent);
                    sw.Close();
                }
            }
            //foreach (var procOutput in processedAssemblies)
            //{
            //    string filePath = dirIno.FullName + "\\" + procOutput.FileName;
            //    var fi = new FileInfo(filePath);
            //    if (fi.Exists)
            //    {
            //        var rs = fi.OpenText();
            //        string content = rs.ReadToEnd();
            //        rs.Close();
            //        if (content == procOutput.FileContent) continue;
            //    }
            //    fi.Delete();
            //    using (var sw = new StreamWriter(filePath))
            //    {
            //        sw.Write(procOutput.FileContent);
            //        sw.Close();
            //    }
            //}
            
        }
    }
}
