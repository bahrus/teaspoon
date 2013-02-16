﻿
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
                return this.LiveStatement + this.Comment;
            }
        }

        
    }
}
