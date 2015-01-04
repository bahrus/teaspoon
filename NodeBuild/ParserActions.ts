//from http://stackoverflow.com/questions/280634/endswith-in-javascript
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');

//#region Helper functions
export function endsWith(str: string, suffix: string) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export function startsWith(str: string, prefix: string) {
    return str.substr(0, prefix.length) === prefix;
}

export function replaceStartWith(str: string, prefix: string, replaceText: string) {
    if (!startsWith(str, prefix)) return str;
    return str.substr(prefix.length);
}

export function replaceEndWith(str: string, suffix: string, replaceText: string) {
    var iPosOfEnd = str.indexOf(suffix, str.length - suffix.length);
    if (iPosOfEnd === -1) return str;
    return str.substr(0, iPosOfEnd) + replaceText;
}
//#endregion
//http://benalman.com/news/2012/05/multiple-var-statements-javascript/
//rules:  
// 1)  parenthesis don't cross multiple lines
// 2)  only one dangling brace per line, must be last live character (except comments).
interface ICurlyBraceParser {
    disallowParenthesisInCode?: boolean; // declarative syntax
    disallowNestedBraces?: boolean; //css
}

//rules:  
// 1) only one commented out #region, #endregion per line
// 2) no comments before live code on the same line
interface IRegionCommentParser {

}
enum lineType {
    Empty,
    BeginningComment,
    ContinuingComment,
    EndingComment,
    CodeAndSingleLineComment,
    SingleLineComment,
    BeginningCommentAndRegionComment,
    EndingCommentAndEndRegionComment,
    RegionComment,
    EndRegionComment,
    SingleLineStatement,
};

interface ILightlyParsedLine {
    lineType: lineType;
    lineNumber: number;
    liveStatement?: string;
    commentText?: string;
}
  
interface ICommentParserState extends ILineParserState {
    lightlyParsedLines: ILightlyParsedLine[];
}
//Rules:  
// 1)  quotes don't span multiple lines http://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript
interface ICommentParser extends ca.IAction{
    regionCommentParser?: IRegionCommentParser;
    ignoreSingleLineComments?: boolean; //css
    state?: ICommentParserState;
}

interface ILineParserState extends ca.IActionState {
    Lines: string[];
}

interface ILineParser extends fsa.IFileProcessorAction {
    commentParser?: ICommentParser
}
