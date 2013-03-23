using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using CurlyBraceParser;
using CurlyBraceParser.CSharp;
using System.IO;
using System.Linq;
using System.Reflection;
using System.CodeDom.Compiler;
using InterfaceTestLibrary;
using System.Collections.Generic;


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
            //string filePath = dirInfo.FullName + "\\ElX.ts";
            string filePath = dirInfo.FullName + "\\Interface_ElX.ts";
            var output = Parser.ParseFile(filePath);
            var cs = output.ToCSharpVSProject();
            //var output = tsp.

            string csharp = cs.CSFiles[0].Content;

            //tsp:
            //var render = tsp.Create<IRenderable>({
            //      parentElemnt:null,
            //      ID: null,
            //});

            //c#:
            var render = tsp.Renderable_IRenderable.Create(
                parentElement: null, 
                ID: null
            );
        }
        
        [TestMethod]
        public void TestInterfaceToClassConstructor()
        {
            var b = new DoNothing();
            //var assemblies = this.GetType().Assembly.GetReferencedAssemblies().ToList();
            //var assemblyToClasses = new Dictionary<string, string>();
            //this.GetType().Assembly.GetReferencedAssemblies().ToList().ForEach(assemblyName =>
            //{
            //    var assembly = Assembly.Load(assemblyName);
            //    var generatedCodeAttribute =  assembly.GetCustomAttribute<GeneratedCodeAttribute>();
            //    if (generatedCodeAttribute == null) return;
            //    if (generatedCodeAttribute.Tool != "tsp") return;
            //    assemblyToClasses[assemblyName.Name] = assembly.InterfacesToConstructorClasses();
            //});
            var c = new InterfaceTestLibrary.InterfaceA_LibA_defaultImpl(
                StringProp2: "Hello",
                StringProp3: "World"
            );
            var ggg = new InterfaceTestLibrary.ClassA
            {
                StringProp1 = "hi",
            };
            //var defaultImplCasses = this.GetType().Assembly.ToDefaultImplClasses();
            //var d = System.Environment.CurrentDirectory;
            //foreach (var implClass in defaultImplCasses)
            //{
            //    string filePath = d + "\\" + implClass.Key + ".defaultImpl.cs";
            //    var fi = new FileInfo(filePath);
            //    if (fi.Exists)
            //    {
            //        var rs = fi.OpenText();
            //        string content = rs.ReadToEnd();
            //        rs.Close();
            //        if (content == implClass.Value) continue;
            //    }
            //    fi.Delete();
            //    using (var sw = new StreamWriter(filePath))
            //    {
            //        sw.Write(implClass.Value);
            //        sw.Close();
            //    }
                        
                    
                
            //}
        }

        
    }
}
