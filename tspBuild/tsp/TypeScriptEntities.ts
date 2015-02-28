
module tsp.TypeScriptEntities {
    try {
        require('./Refs');
        global.refs.moduleTarget = tsp;
    } finally { }
    //export interface IOpenStatement extends IStatementNode { }
    

    //export interface IIdentifier extends IEntity {
    //    type: string;
    //}

    class OpenTypeScriptStatement implements ParserActions.IOpenStatement {
        children: ParserActions.IStatement[];
        maxNoOfChildren: number;
        lineNo: number;
        parent: ParserActions.IOpenStatement;
    }

    export class OpenBraceConfigStatement extends OpenTypeScriptStatement { }

    class TypeScriptSingleLineStatement { }

    class OpenComment extends OpenTypeScriptStatement { }
    class JSDocComment extends OpenComment { }

    export interface IEntity {
        name: string;
        JSDoc: JSDocComment;
    }

    export class InterfaceFieldDefinition extends TypeScriptSingleLineStatement { }

    export class InterfaceDeclaration extends OpenBraceConfigStatement implements IEntity {
        JSDoc: JSDocComment;
        constructor(public name: string) {
            super();
        }
        extends: string[];
        fields: InterfaceFieldDefinition[];
    }
    
    export class OpenConstDeclaration extends OpenBraceConfigStatement {
        constructor(public name: string) {
            super();
        }
        type: string;
    }
    export class ReturnBlock { }
    export class LambdaFieldOpenExpression extends OpenBraceConfigStatement {
        constructor(public block: ReturnBlock) {
            super();

        }
        
    }
    export class InterfaceInstanceFieldOpenDeclaration extends OpenBraceConfigStatement { }
    
    export class OpenBracketConfigStatement extends OpenTypeScriptStatement { }
    export class ListDeclaration extends OpenBraceConfigStatement { }

    export class OpenStringTemplate { }

    export type OpenConfigStatement = OpenBraceConfigStatement | OpenBracketConfigStatement | OpenStringTemplate;

    export class TypeAlias extends TypeScriptSingleLineStatement {
        pattern = 'type QName = RHS;'
    }
    export class ModuleAlias extends TypeScriptSingleLineStatement { }
    export class StringConst extends TypeScriptSingleLineStatement { }
    export class StringFieldInitializer extends TypeScriptSingleLineStatement { }
    export class NumberConst extends TypeScriptSingleLineStatement { }
    export class NumberFieldInitializer extends TypeScriptSingleLineStatement { }
    export class SingleLineComment extends TypeScriptSingleLineStatement { }
    export class BooleanConst extends TypeScriptSingleLineStatement { }
    export class BooleanFieldInitializer extends TypeScriptSingleLineStatement { }
    export class RequireStatement extends TypeScriptSingleLineStatement { }
    export class EmptyStatement extends TypeScriptSingleLineStatement { }
    export class ArrowFunctionListItem extends TypeScriptSingleLineStatement { }
    export class ArrowFunctionField extends TypeScriptSingleLineStatement { }
    

    export type TopLevelStatement = RequireStatement | TypeAlias | StringConst | SingleLineComment | EmptyStatement
    | OpenComment | JSDocComment;

    export class ModuleOpenDeclaration extends OpenBraceConfigStatement implements IEntity {
        JSDoc: JSDocComment;
        constructor(public name: string) {
            super();
        }
        members: TopLevelStatement[];
    }

    export type InterfaceInstanceFieldValue = StringFieldInitializer | NumberFieldInitializer | BooleanFieldInitializer |
    InterfaceInstanceFieldOpenDeclaration | LambdaFieldOpenExpression | ArrowFunctionField;

    export class ConstInterfaceInstanceOpenDeclaration extends OpenBraceConfigStatement {
        constructor(public name: string) {
            super();
        }
        type: string;

        fields: InterfaceInstanceFieldValue[];
    }

}

try {
    global.refs.ref = ['TypeScriptEntities', tsp.TypeScriptEntities];
} finally { }