if (typeof (global) !== 'undefined') {
    require('./Refs');
}
module tsp.TypeScriptEntities {
    //export interface IOpenStatement extends IStatementNode { }
    export interface IEntity {
        name: string;
        JSDoc: JSDocComment;
    }

    export interface IIdentifier extends IEntity {
        type: string;
    }

    export class OpenBraceConfigStatement extends ParserActions.OpenStatement {

    }
    export class InterfaceDeclaration extends OpenBraceConfigStatement implements IEntity {
        JSDoc: JSDocComment;
        constructor(public name: string) {
            super();
        }
        extends: string[];
        fields: InterfaceFieldDefinition[];
    }
    export class ModuleOpenDeclaration extends OpenBraceConfigStatement implements IEntity {
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
    export class InterfaceInstanceFieldOpenDeclaration extends OpenBraceConfigStatement { }
    export class ConstInterfaceInstanceOpenDeclaration extends OpenBraceConfigStatement {
        constructor(public name: string) {
            super();
        }
        type: string;

        fields: InterfaceInstanceFieldValue[];
    }
    export class ReturnBlock { }

    export interface OpenComment extends ParserActions.OpenStatement { }
    export interface JSDocComment extends OpenComment { }

    export class OpenBracketConfigStatement extends ParserActions.OpenStatement { }
    export class ListDeclaration extends OpenBraceConfigStatement { }

    export class OpenStringTemplate { }

    export type OpenConfigStatement = OpenBraceConfigStatement | OpenBracketConfigStatement | OpenStringTemplate;

    export class TypeAlias extends ParserActions.SingleLineStatement {
        pattern = 'type QName = RHS;'
    }
    export class ModuleAlias extends ParserActions.SingleLineStatement { }
    export class StringConst extends ParserActions.SingleLineStatement { }
    export class StringFieldInitializer extends ParserActions.SingleLineStatement { }
    export class NumberConst extends ParserActions.SingleLineStatement { }
    export class NumberFieldInitializer extends ParserActions.SingleLineStatement { }
    export class BooleanConst extends SingleLineComment { }
    export class BooleanFieldInitializer extends ParserActions.SingleLineStatement { }
    export class RequireStatement extends ParserActions.SingleLineStatement { }
    export class EmptyStatement extends ParserActions.SingleLineStatement { }
    export class SingleLineComment extends ParserActions.SingleLineStatement { }
    export class ArrowFunctionListItem extends ParserActions.SingleLineStatement { }
    export class ArrowFunctionField extends ParserActions.SingleLineStatement { }
    export class InterfaceFieldDefinition extends ParserActions.SingleLineStatement { }

    export type TopLevelStatement = RequireStatement | TypeAlias | StringConst | SingleLineComment | EmptyStatement
    | OpenComment | JSDocComment;

    export type InterfaceInstanceFieldValue = StringFieldInitializer | NumberFieldInitializer | BooleanFieldInitializer |
    InterfaceInstanceFieldOpenDeclaration | LambdaFieldOpenExpression | ArrowFunctionField;

}

if (typeof (global) !== 'undefined') {
    var guid = 'tsp-81B44259-976C-4DFC-BE00-6E901415FEF3';
    var globalNS = global[guid] || 'tsp';
    if (!global[globalNS]) global[globalNS] = {};
    global[globalNS].TypeScriptEntities = tsp.TypeScriptEntities;
}