//from http://stackoverflow.com/questions/280634/endswith-in-javascript
import ca = require('./CommonActions');
import fsa = require('./FileSystemActions');



interface ILineParserState extends ca.IActionState {
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
  
interface ILineCategorizerState extends ca.IActionState {
    lightlyParsedLines: ILightlyParsedLine[];
}
//Rules:  
// 1)  quotes don't span multiple lines http://stackoverflow.com/questions/805107/creating-multiline-strings-in-javascript
export interface ILineCategorizer extends ca.IAction{
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

class SingleLineStatement extends Statement { }

class OpenStatement extends Statement {
    children: Statement[];
    maxNoOfChildren: number;
}

interface ILineNodifierState extends ca.IActionState {
    rootNodes?: Statement[];
}

export interface ILineNodifier extends ca.IAction {
    lineCategorizer?: ILineCategorizer;
    state?: ILineNodifierState;
}

export module TypescriptEntities {

    //export interface IOpenStatement extends IStatementNode { }
    export interface IEntity {
        name: string;
        JSDoc: JSDocComment;
    }

    export interface IIdentifier extends IEntity {
        type: string;
    }

    export class OpenBraceConfigStatement extends OpenStatement {
        
    }
    export class InterfaceDeclaration extends OpenBraceConfigStatement implements IEntity {
        JSDoc: JSDocComment;
        constructor(public name: string) {
            super();
        }
        extends: string[];
        fields: InterfaceFieldDefinition[];
    }
    export class ModuleOpenDeclaration extends OpenBraceConfigStatement implements IEntity  {
        JSDoc: JSDocComment;
        constructor(public name: string) {
            super();
        }
        members: TopLevelStatement[];
    }
    //export class OpenConstDeclaration extends OpenBraceConfigStatement {
    //    constructor(public name: string) {
    //        super();
    //    }
    //    type: string;
    //}
    export class LambdaFieldOpenExpression extends OpenBraceConfigStatement {
        constructor(public block: ReturnBlock) {
            super();

        }
        //static FromOpenStatement(openStatement: OpenStatement) {
        //    if (!openStatement.children || openStatement.children.length != 1) {
        //        throw 'tbd';
        //    }
        //}
        //static IsOpenLambdaExpression(openStatement: OpenStatement) {
        //}
    }
    export class InterfaceInstanceFieldOpenDeclaration          extends OpenBraceConfigStatement{ }
    export class ConstInterfaceInstanceOpenDeclaration extends OpenBraceConfigStatement {
        constructor(public name: string) {
            super();
        }
        type: string;
        
        fields: InterfaceInstanceFieldValue[];
    }
    export class ReturnBlock { }

    export interface OpenComment                            extends OpenStatement { }
    export interface JSDocComment                           extends OpenComment { }

    export class OpenBracketConfigStatement                 extends OpenStatement{ }
    export class ListDeclaration                            extends OpenBraceConfigStatement { }

    export class OpenStringTemplate { }

    export type OpenConfigStatement = OpenBraceConfigStatement | OpenBracketConfigStatement | OpenStringTemplate;

    export class TypeAlias extends SingleLineStatement {
        pattern = 'type QName = RHS;'
    }
    export class ModuleAlias                                extends SingleLineStatement { }
    export class StringConst extends SingleLineStatement { }
    export class StringFieldInitializer extends SingleLineStatement { }
    export class NumberConst extends SingleLineStatement { }
    export class NumberFieldInitializer extends SingleLineStatement { }
    export class BooleanConst extends SingleLineComment { }
    export class BooleanFieldInitializer extends SingleLineStatement { }
    export class RequireStatement                           extends SingleLineStatement { }
    export class EmptyStatement                             extends SingleLineStatement { }
    export class SingleLineComment                          extends SingleLineStatement { }
    export class ArrowFunctionListItem extends SingleLineStatement { }
    export class ArrowFunctionField extends SingleLineStatement { }
    export class InterfaceFieldDefinition extends SingleLineStatement { }

    export type TopLevelStatement = RequireStatement | TypeAlias | StringConst | SingleLineComment | EmptyStatement
    | OpenComment | JSDocComment;

    export type InterfaceInstanceFieldValue = StringFieldInitializer | NumberFieldInitializer | BooleanFieldInitializer |
        InterfaceInstanceFieldOpenDeclaration | LambdaFieldOpenExpression | ArrowFunctionField;

}



