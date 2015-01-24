﻿if (typeof (global) !== 'undefined') {
    require('./Refs');
}

module tsp.ParserActions {
    var ca = tsp.CommonActions
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

    interface ILineParserState extends CommonActions.IActionState {
        Lines: string[];
    }

    export interface ILineParser {
        textToParse?: string;
        state?: ILineParserState;
    }


    //http://benalman.com/news/2012/05/multiple-var-statements-javascript/
    //rules:  
    // 1)  parenthesis don't cross multiple lines
    // 2)  only one dangling brace per line, must be last live character (except comments).
    //interface ICurlyBraceParser {
    //    disallowParenthesisInCode?: boolean; // declarative syntax
    //    disallowNestedBraces?: boolean; //css
    //}

    //rules:  
    // 1) only one commented out #region, #endregion per line
    // 2) no comments before live code on the same line
    ////interface IStructure {

    ////}
    enum lineType {
        Empty,
        BeginningComment,
        ContinuingComment,
        EndingComment,
        CodeAndSingleLineComment,
        SingleLineComment,
        BeginningCommentAndRegionComment,
        EndingCommentAndEndRegionComment,
        BeginningRegionComment,
        EndRegionComment,
        SingleLineStatement,
        BeginningBrace,
        EndingBrace,
        BeginningBracket,
        EndingBracket,
        BeginningStringTemplate,
        EndingStringTeplate,
        BeginningParenthesis,
        EndingParenthesis,
        BeginningParenthesisBrace,
        EndingParenthesisBrace,
    };

    interface ITokenDelimiter {
        opener?: string;
        closer?: string;
        associatedLineType?: lineType;
    }

    interface ILightlyParsedLine {
        lineType: lineType;
        lineNumber: number;
        liveStatement?: string;
        commentText?: string;
    }

    interface ILineCategorizerState extends CommonActions.IActionState {
        lightlyParsedLines: ILightlyParsedLine[];
    }
    //Rules:  
    // 1)  quotes don't span multiple lines http://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript
    export interface ILineCategorizer extends CommonActions.IAction {
        ignoreSingleLineComments?: boolean; //css
        lineParser?: ILineParser;
        state?: ILineCategorizerState;
        childDelimiters?: ITokenDelimiter[];
        forbiddenDelimiters?: ITokenDelimiter[];
        //maxOpenChildDelimiterPerLine?: number;

    }

    class Statement {
        lineNo: number;
        parent: OpenStatement;
    }

    export class SingleLineStatement extends Statement { }

    export class OpenStatement extends Statement {
        children: Statement[];
        maxNoOfChildren: number;
    }

    interface ILineNodifierState extends CommonActions.IActionState {
        rootNodes?: Statement[];
    }

    export interface ILineNodifier extends CommonActions.IAction {
        lineCategorizer?: ILineCategorizer;
        state?: ILineNodifierState;
    }


}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].ParserActions = tsp.ParserActions;
}