﻿using ClassGenMacros;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
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
    public interface ILiveStatement : ILine
    {
        string Statement { get; set; }
        [DoNotAutoGenerate]
        string FrontTrimmedLiveStatement { get;}

        [PassThroughComponent]
        [Required]
        ILine Line { get; set; }
    }

    [AutoGenerateDefaultImplementation]
    public interface IReferenceStatement : ILine
    {
        string ClientSideReference { get; set; }

        [PassThroughComponent]
        ILine Line { get; set; }
    }

    public interface IOpenStatement : ILiveStatement
    {
        List<ILine> Children { get; set; }
        string ClosingLineComment { get; set;}
        string OptionalLineSeparator { get; set; }
        string ClosingLine { get; set; }

        [PassThroughComponent]
        [Required]
        ILiveStatement LiveStatementBase { get; set; }

    }

    [AutoGenerateDefaultImplementation]
    public interface IOpenBraceStatement : IOpenStatement {}        
    
    public interface IStaticInterfaceMethod
    {
        string Name { get; set; }

        List<LiveStatement> Parameters { get; set; }

        string ReturnType { get; set; }
    }

    [AutoGenerateDefaultImplementation]
    public interface IStaticFunction : IHaveAccessModifier, IOpenBraceStatement
    {
        string Name { get; set; }

        List<Parameter> Args { get; set; }

        string ReturnType { get; set; }

        [PassThroughComponent]
        [Required]
        IOpenBraceStatement OpenBraceStatementBase { get; set; }
    }

    public interface IHaveAccessModifier
    {
        bool Public { get; set; }
    }

    [AutoGenerateDefaultImplementation]
    public interface IModule : IOpenBraceStatement
    {
        string FullName { get; set; }

        [PassThroughComponent]
        [Required]
        IOpenBraceStatement OpenBraceStatementBase { get; set; }
    }

    [AutoGenerateDefaultImplementation]
    public interface IInterface : IOpenBraceStatement, IHaveAccessModifier
    {
        List<string> Extends { get; set; }

        string Name { get; set; }

        [PassThroughComponent]
        [Required]
        IOpenBraceStatement OpenBraceStatementBase { get; set; }

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


}
