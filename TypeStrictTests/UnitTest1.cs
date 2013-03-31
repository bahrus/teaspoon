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
using InterfaceTestLibrary.ExtensionLib_extns;


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
            
            var c = new InterfaceA_LibA_defaultImpl(
                StringProp2: "Hello",
                StringProp3: "World"
            );
            LibA.InterfaceA aaa = null;
            
            var d = aaa.Create<LibA.InterfaceA>(
                StringProp2: "Hello",
                StringProp3: "World"
            );
            
            c.Create(Elements.Canvas);
            ///InterfaceTestLibrary.
            var ggg = new ClassA
            {
                StringProp1 = "hi",
            };
            
                        
                    
                
            //}
        }

        
    }

   
}

namespace InterfaceTestLibrary
{
    public static class ClassCreator
    {
        public static InterfaceA_LibA_defaultImpl Create<T>(this LibA.InterfaceA _this,  System.String StringProp2, System.String StringProp3, System.String StringProp1 = "Hello", System.String StringProp4 = null, System.String StringProp5 = null, System.String StringProp6 = null, System.String StringProp7 = null) where T : LibA.InterfaceA
        {
            return new InterfaceA_LibA_defaultImpl(StringProp2, StringProp3, StringProp1, StringProp4, StringProp5, StringProp6, StringProp7);
        }

        public static CurlyBraceParser.InterfaceStatement Create<T>(this CurlyBraceParser.ICanBePublicStatement _this, System.String StringProp2, System.String StringProp3, System.String StringProp1 = "Hello", System.String StringProp4 = null, System.String StringProp5 = null, System.String StringProp6 = null, System.String StringProp7 = null) where T : CurlyBraceParser.ICanBePublicStatement
        {
            return new CurlyBraceParser.InterfaceStatement();
        }
    }
}
