
namespace CurlyBraceParser
{
    public class Statement : Line
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
        public override string Content
        {
            get
            {
                return this.LiveStatement + " //" + this.Comment;
            }
        }
        public override string ToString()
        {
            return this.LiveStatement;
        }

        public void CopyStatementPropsTo(Statement To)
        {
            this.CopyLinePropsTo(To);
            To.LiveStatement = this.LiveStatement;
        }
    }
}
