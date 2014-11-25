namespace CurlyBraceParser{
	public partial class Line : ILine{
		public System.Int32 LineNumber{get;set;}
		public System.String FileName{get;set;}
		public System.Boolean IncludeNextLine{get;set;}
		public IOpenStatement Parent{get;set;}
		public System.String Comment{get;set;}
		public Line(System.Int32 LineNumber = 0, System.String FileName = null, System.Boolean IncludeNextLine = false, IOpenStatement Parent = null, System.String Comment = null){
			this.LineNumber = LineNumber;
			this.FileName = FileName;
			this.IncludeNextLine = IncludeNextLine;
			this.Parent = Parent;
			this.Comment = Comment;
		}
	}
	public partial class LiveStatement : ILiveStatement{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{get;set;}
		public ILine Line{get;set;}
		public LiveStatement(ILine Line, System.String Statement = null){
			this.Statement = Statement;
			this.Line = Line;
		}
	}
	public partial class ReferenceStatement : IReferenceStatement{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String ClientSideReference{get;set;}
		public ILine Line{get;set;}
		public ReferenceStatement(System.String ClientSideReference = null, ILine Line = null){
			this.ClientSideReference = ClientSideReference;
			this.Line = Line;
		}
	}
	public partial class OpenBraceStatement : IOpenBraceStatement{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public ILine Line{get;set;}
		public System.Collections.Generic.List<ILine> Children{get;set;}
		public System.String ClosingLineComment{get;set;}
		public System.String OptionalLineSeparator{get;set;}
		public System.String ClosingLine{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public OpenBraceStatement(ILine Line, ILiveStatement LiveStatementBase, System.Collections.Generic.List<ILine> Children = null, System.String ClosingLineComment = null, System.String OptionalLineSeparator = null, System.String ClosingLine = null){
			this.Line = Line;
			this.Children = Children;
			this.ClosingLineComment = ClosingLineComment;
			this.OptionalLineSeparator = OptionalLineSeparator;
			this.ClosingLine = ClosingLine;
			this.LiveStatementBase = LiveStatementBase;
		}
	}
	public partial class StaticInterfaceMethod : IStaticInterfaceMethod{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public System.Collections.Generic.List<ILine> Children{
			get {return this.OpenBraceStatementBase.Children;}
			set{this.OpenBraceStatementBase.Children = this.OpenBraceStatementBase.Children;}
		}
		public System.String ClosingLineComment{
			get {return this.OpenBraceStatementBase.ClosingLineComment;}
			set{this.OpenBraceStatementBase.ClosingLineComment = this.OpenBraceStatementBase.ClosingLineComment;}
		}
		public System.String OptionalLineSeparator{
			get {return this.OpenBraceStatementBase.OptionalLineSeparator;}
			set{this.OpenBraceStatementBase.OptionalLineSeparator = this.OpenBraceStatementBase.OptionalLineSeparator;}
		}
		public System.String ClosingLine{
			get {return this.OpenBraceStatementBase.ClosingLine;}
			set{this.OpenBraceStatementBase.ClosingLine = this.OpenBraceStatementBase.ClosingLine;}
		}
		public IOpenBraceStatement OpenBraceStatementBase{get;set;}
		public ILine Line{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public System.String Name{get;set;}
		public System.Collections.Generic.List<ILiveStatement> Parameters{get;set;}
		public System.String ReturnType{get;set;}
		public StaticInterfaceMethod(IOpenBraceStatement OpenBraceStatementBase, ILine Line, ILiveStatement LiveStatementBase, System.String Name = null, System.Collections.Generic.List<ILiveStatement> Parameters = null, System.String ReturnType = null){
			this.OpenBraceStatementBase = OpenBraceStatementBase;
			this.Line = Line;
			this.LiveStatementBase = LiveStatementBase;
			this.Name = Name;
			this.Parameters = Parameters;
			this.ReturnType = ReturnType;
		}
	}
	public partial class DataElement : IDataElement{
		public System.String HelpText{get;set;}
		public System.String Type{get;set;}
		public System.String Name{get;set;}
		public DataElement(System.String HelpText = null, System.String Type = null, System.String Name = null){
			this.HelpText = HelpText;
			this.Type = Type;
			this.Name = Name;
		}
	}
	public partial class StaticFunction : IStaticFunction{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public System.Collections.Generic.List<ILine> Children{
			get {return this.OpenBraceStatementBase.Children;}
			set{this.OpenBraceStatementBase.Children = this.OpenBraceStatementBase.Children;}
		}
		public System.String ClosingLineComment{
			get {return this.OpenBraceStatementBase.ClosingLineComment;}
			set{this.OpenBraceStatementBase.ClosingLineComment = this.OpenBraceStatementBase.ClosingLineComment;}
		}
		public System.String OptionalLineSeparator{
			get {return this.OpenBraceStatementBase.OptionalLineSeparator;}
			set{this.OpenBraceStatementBase.OptionalLineSeparator = this.OpenBraceStatementBase.OptionalLineSeparator;}
		}
		public System.String ClosingLine{
			get {return this.OpenBraceStatementBase.ClosingLine;}
			set{this.OpenBraceStatementBase.ClosingLine = this.OpenBraceStatementBase.ClosingLine;}
		}
		public IOpenBraceStatement OpenBraceStatementBase{get;set;}
		public ILine Line{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public System.Boolean Public{get;set;}
		public System.String Name{get;set;}
		public System.Collections.Generic.List<IParameter> Args{get;set;}
		public System.String ReturnType{get;set;}
		public StaticFunction(IOpenBraceStatement OpenBraceStatementBase, ILine Line, ILiveStatement LiveStatementBase, System.Boolean Public = false, System.String Name = null, System.Collections.Generic.List<IParameter> Args = null, System.String ReturnType = null){
			this.OpenBraceStatementBase = OpenBraceStatementBase;
			this.Line = Line;
			this.LiveStatementBase = LiveStatementBase;
			this.Public = Public;
			this.Name = Name;
			this.Args = Args;
			this.ReturnType = ReturnType;
		}
	}
	public partial class Module : IModule{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public System.Collections.Generic.List<ILine> Children{
			get {return this.OpenBraceStatementBase.Children;}
			set{this.OpenBraceStatementBase.Children = this.OpenBraceStatementBase.Children;}
		}
		public System.String ClosingLineComment{
			get {return this.OpenBraceStatementBase.ClosingLineComment;}
			set{this.OpenBraceStatementBase.ClosingLineComment = this.OpenBraceStatementBase.ClosingLineComment;}
		}
		public System.String OptionalLineSeparator{
			get {return this.OpenBraceStatementBase.OptionalLineSeparator;}
			set{this.OpenBraceStatementBase.OptionalLineSeparator = this.OpenBraceStatementBase.OptionalLineSeparator;}
		}
		public System.String ClosingLine{
			get {return this.OpenBraceStatementBase.ClosingLine;}
			set{this.OpenBraceStatementBase.ClosingLine = this.OpenBraceStatementBase.ClosingLine;}
		}
		public IOpenBraceStatement OpenBraceStatementBase{get;set;}
		public ILine Line{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public System.String FullName{get;set;}
		public Module(IOpenBraceStatement OpenBraceStatementBase, ILine Line, ILiveStatement LiveStatementBase, System.String FullName = null){
			this.OpenBraceStatementBase = OpenBraceStatementBase;
			this.Line = Line;
			this.LiveStatementBase = LiveStatementBase;
			this.FullName = FullName;
		}
	}
	public partial class Interface : IInterface{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public System.Collections.Generic.List<ILine> Children{
			get {return this.OpenBraceStatementBase.Children;}
			set{this.OpenBraceStatementBase.Children = this.OpenBraceStatementBase.Children;}
		}
		public System.String ClosingLineComment{
			get {return this.OpenBraceStatementBase.ClosingLineComment;}
			set{this.OpenBraceStatementBase.ClosingLineComment = this.OpenBraceStatementBase.ClosingLineComment;}
		}
		public System.String OptionalLineSeparator{
			get {return this.OpenBraceStatementBase.OptionalLineSeparator;}
			set{this.OpenBraceStatementBase.OptionalLineSeparator = this.OpenBraceStatementBase.OptionalLineSeparator;}
		}
		public System.String ClosingLine{
			get {return this.OpenBraceStatementBase.ClosingLine;}
			set{this.OpenBraceStatementBase.ClosingLine = this.OpenBraceStatementBase.ClosingLine;}
		}
		public System.String HelpText{get;set;}
		public IOpenBraceStatement OpenBraceStatementBase{get;set;}
		public System.Boolean Public{get;set;}
		public ILine Line{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public System.Collections.Generic.List<System.String> Extends{get;set;}
		public System.String Name{get;set;}
		public System.Collections.Generic.List<IField> Fields{get;set;}
		public Interface(IOpenBraceStatement OpenBraceStatementBase, ILine Line, ILiveStatement LiveStatementBase, System.String HelpText = null, System.Boolean Public = false, System.Collections.Generic.List<System.String> Extends = null, System.String Name = null, System.Collections.Generic.List<IField> Fields = null){
			this.HelpText = HelpText;
			this.OpenBraceStatementBase = OpenBraceStatementBase;
			this.Public = Public;
			this.Line = Line;
			this.LiveStatementBase = LiveStatementBase;
			this.Extends = Extends;
			this.Name = Name;
			this.Fields = Fields;
		}
	}
	public partial class Field : IField{
		public System.String HelpText{get;set;}
		public System.String Type{get;set;}
		public System.String Name{get;set;}
		public System.Boolean Optional{get;set;}
		public Field(System.String HelpText = null, System.String Type = null, System.String Name = null, System.Boolean Optional = false){
			this.HelpText = HelpText;
			this.Type = Type;
			this.Name = Name;
			this.Optional = Optional;
		}
	}
	public partial class Class : IClass{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public System.Collections.Generic.List<ILine> Children{
			get {return this.OpenBraceStatementBase.Children;}
			set{this.OpenBraceStatementBase.Children = this.OpenBraceStatementBase.Children;}
		}
		public System.String ClosingLineComment{
			get {return this.OpenBraceStatementBase.ClosingLineComment;}
			set{this.OpenBraceStatementBase.ClosingLineComment = this.OpenBraceStatementBase.ClosingLineComment;}
		}
		public System.String OptionalLineSeparator{
			get {return this.OpenBraceStatementBase.OptionalLineSeparator;}
			set{this.OpenBraceStatementBase.OptionalLineSeparator = this.OpenBraceStatementBase.OptionalLineSeparator;}
		}
		public System.String ClosingLine{
			get {return this.OpenBraceStatementBase.ClosingLine;}
			set{this.OpenBraceStatementBase.ClosingLine = this.OpenBraceStatementBase.ClosingLine;}
		}
		public IOpenBraceStatement OpenBraceStatementBase{get;set;}
		public System.Boolean Public{get;set;}
		public ILine Line{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public System.Collections.Generic.List<System.String> Implements{get;set;}
		public System.String Name{get;set;}
		public Class(IOpenBraceStatement OpenBraceStatementBase, ILine Line, ILiveStatement LiveStatementBase, System.Boolean Public = false, System.Collections.Generic.List<System.String> Implements = null, System.String Name = null){
			this.OpenBraceStatementBase = OpenBraceStatementBase;
			this.Public = Public;
			this.Line = Line;
			this.LiveStatementBase = LiveStatementBase;
			this.Implements = Implements;
			this.Name = Name;
		}
	}
	public partial class Variable : IVariable{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public ILine Line{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public Variable(ILine Line, ILiveStatement LiveStatementBase){
			this.Line = Line;
			this.LiveStatementBase = LiveStatementBase;
		}
	}
	public partial class VariableOBS : IVariableOBS{
		public System.Int32 LineNumber{
			get {return this.Line.LineNumber;}
			set{this.Line.LineNumber = this.Line.LineNumber;}
		}
		public System.String FileName{
			get {return this.Line.FileName;}
			set{this.Line.FileName = this.Line.FileName;}
		}
		public System.Boolean IncludeNextLine{
			get {return this.Line.IncludeNextLine;}
			set{this.Line.IncludeNextLine = this.Line.IncludeNextLine;}
		}
		public IOpenStatement Parent{
			get {return this.Line.Parent;}
			set{this.Line.Parent = this.Line.Parent;}
		}
		public System.String Comment{
			get {return this.Line.Comment;}
			set{this.Line.Comment = this.Line.Comment;}
		}
		public System.String Statement{
			get {return this.LiveStatementBase.Statement;}
			set{this.LiveStatementBase.Statement = this.LiveStatementBase.Statement;}
		}
		public System.String FrontTrimmedLiveStatement{
			get {return this.LiveStatementBase.FrontTrimmedLiveStatement;}
		}
		public System.Collections.Generic.List<ILine> Children{
			get {return this.OpenBraceStatementBase.Children;}
			set{this.OpenBraceStatementBase.Children = this.OpenBraceStatementBase.Children;}
		}
		public System.String ClosingLineComment{
			get {return this.OpenBraceStatementBase.ClosingLineComment;}
			set{this.OpenBraceStatementBase.ClosingLineComment = this.OpenBraceStatementBase.ClosingLineComment;}
		}
		public System.String OptionalLineSeparator{
			get {return this.OpenBraceStatementBase.OptionalLineSeparator;}
			set{this.OpenBraceStatementBase.OptionalLineSeparator = this.OpenBraceStatementBase.OptionalLineSeparator;}
		}
		public System.String ClosingLine{
			get {return this.OpenBraceStatementBase.ClosingLine;}
			set{this.OpenBraceStatementBase.ClosingLine = this.OpenBraceStatementBase.ClosingLine;}
		}
		public IOpenBraceStatement OpenBraceStatementBase{get;set;}
		public ILine Line{get;set;}
		public ILiveStatement LiveStatementBase{get;set;}
		public System.Collections.Generic.List<IParameter> Parameters{get;set;}
		public VariableOBS(IOpenBraceStatement OpenBraceStatementBase, ILine Line, ILiveStatement LiveStatementBase, System.Collections.Generic.List<IParameter> Parameters = null){
			this.OpenBraceStatementBase = OpenBraceStatementBase;
			this.Line = Line;
			this.LiveStatementBase = LiveStatementBase;
			this.Parameters = Parameters;
		}
	}
}

