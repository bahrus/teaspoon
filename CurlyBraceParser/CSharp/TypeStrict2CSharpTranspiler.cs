using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser.CSharp
{
    public static class TypeStrict2CSharpTranspiler
    {
        public static VSProject ToCSharpVSProject(this ProcessedFiles files)
        {
            var context = new CSharpCompilerContext
            {
                Project = new VSProject
                {
                    
                }
            };
            context.Project.CSFiles = files.Select(file => {
                context.CurrentTypeStrictFile = file.Value;
                context.CurrentCSharpOutputFile = new CSharpFile();
                return ToCSharpVSFile(context);
            }).ToList();
            
            return context.Project;
        }

        private static CSharpFile ToCSharpVSFile(CSharpCompilerContext context)
        {
            var csFile = new CSharpFile
            {
                
            };
            context.CurrentCSharpOutputFile = csFile;
            foreach (var line in context.CurrentTypeStrictFile.Lines)
            {
                context.CurrentLine = line;
                ProcessTopLevelLine(context);
                
                
            }
            return csFile;
        }

        private static void ProcessTopLevelLine(CSharpCompilerContext context)
        {
            var ccsOut = context.CurrentCSharpOutputFile;
            context.CurrentLine
                    .IfType<ReferenceStatement>(refStatement =>
                    {
                    })
                    .ElseIfType<ModuleStatement>(modStatement =>
                    {
                        string fn = modStatement.FullName;
                        if (fn.Contains('.'))
                        {
                            ccsOut.NameSpace = fn.SubstringBeforeLast(".");
                            ccsOut.OuterStaticClassName = fn.SubstringAfterLast(".");
                        }
                        else
                        {
                            ccsOut.OuterStaticClassName = fn;
                        }
                        ProcessModule(context, modStatement);
                    })
                ;
        }

        private static void ProcessModule(CSharpCompilerContext context, ModuleStatement mod)
        {
            if (mod.Children == null) return;
            foreach (var line in mod.Children)
            {
                context.CurrentLine = line;
                ProcessModuleLine(context);
            }
        }

        private static void ProcessModuleLine(CSharpCompilerContext context)
        {
            var csharpFlie = context.CurrentCSharpOutputFile;
            context.CurrentLine
                .IfType<InterfaceStatement>(interfaceStatement =>
                {
                    if (csharpFlie.Interfaces == null)
                    {
                        csharpFlie.Interfaces = new List<InterfaceStatement>();
                    }
                    csharpFlie.Interfaces.Add(interfaceStatement);
                });
        }

        //private static void ProcessLines(List<Line> lines, 
    }

    public class CSharpCompilerContext
    {
        public VSProject Project { get; set; }
        public ProcessedFile CurrentTypeStrictFile { get; set; }
        public CSharpFile CurrentCSharpOutputFile { get; set; }
        public Line CurrentLine{get;set;}
    }
}
