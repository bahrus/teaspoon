
namespace CurlyBraceParser
{
    public partial class Statement : IHaveLiveStatement
    {
        /// <summary>
        /// Statement not in comments
        /// </summary>
        public string LiveStatement { get; set;}


        private string _FrontTrimmedLiveStatement;
        public string FrontTrimmedLiveStatement
        {
            get
            {
                if (_FrontTrimmedLiveStatement == null)
                {
                    _FrontTrimmedLiveStatement = LiveStatement.TrimStart();
                }
                return _FrontTrimmedLiveStatement;
            }
        }
        
        public override string ToString()
        {
            return this.LiveStatement;
        }

        
    }

    public partial class Statement : ILine
    {

        public Statement(Line line)
        {
            this.Line = line;
        }

        
        public ILine Line { get; set; }

        public int LineNumber               { get { return Line.LineNumber; } set { Line.LineNumber = value; } }

        public string FileName { get { return Line.FileName; } set { Line.FileName = value; } }
        

        public bool IncludeNextLine { get { return Line.IncludeNextLine; } set { Line.IncludeNextLine = value; } }
        

        public IOpenStatement Parent { get { return Line.Parent; } set { Line.Parent = value; } }
        
        public string Comment { get { return Line.Comment; } set { Line.Comment = value; } }

        
    }

    //public static class ILiveStatementEx
    //{
    //    public static string GetStatementWithoutPublicKeyWord(this
    //}
}
