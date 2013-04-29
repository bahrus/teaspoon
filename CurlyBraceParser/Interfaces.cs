﻿using ClassGenMacros;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CurlyBraceParser
{
    [AutoGenerateDefaultImplementation]
    public interface ILine
    {
        int LineNumber { get; set; }
        string FileName { get; set; }
        bool IncludeNextLine { get; set; }
        IOpenStatement Parent { get; set; }
        string Comment { get; set; }
    }

    [AutoGenerateDefaultImplementation]
    public interface IHaveLiveStatement : ILine
    {
        string LiveStatement { get; set; }
        string FrontTrimmedLiveStatement { get;}
        [PassThroughComponent]
        ILine Line { get; set; }
    }


    public interface IOpenStatement : IHaveLiveStatement
    {
        List<ILine> Children { get; set; }
        string ClosingLineComment { get; set;}
        string OptionalLineSeparator { get; set; }
        string ClosingLine { get; set; }
        IHaveLiveStatement LiveStatementBase { get; set; }
    }

    public interface IOpenBraceStatement : IOpenStatement { }        
    
    public interface IStaticInterfaceMethod
    {
        string Name { get; set; }

        List<Statement> Parameters { get; set; }

        string ReturnType { get; set; }
    }

    public interface IStaticFunction : IHaveAccessModifier, IHaveLiveStatement
    {
        string Name { get; set; }

        List<Parameter> Args { get; set; }

        string ReturnType { get; set; }
    }

    public interface IHaveAccessModifier
    {
        bool Public { get; set; }
    }

    public interface IModule
    {
        string FullName { get; set; }
    }

    public interface IInterface : IHaveAccessModifier
    {
        List<string> Extends { get; set; }

        string Name { get; set; }

    }

    public interface IClass : IHaveAccessModifier
    {
        List<string> Implements { get; set; }
        bool Public { get; set; }
        string Name { get; set; }
    }

    public interface IVariable
    {
        List<Parameter> Parameters { get; set; }
    }

    public interface IReferenceStatement : ILine
    {
        string ClientSideReference { get; set; }
    }
}
