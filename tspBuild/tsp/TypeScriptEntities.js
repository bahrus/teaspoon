var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsp;
(function (tsp) {
    var TypeScriptEntities;
    (function (TypeScriptEntities) {
        try {
            require('./Refs');
            global.refs.moduleTarget = tsp;
        }
        finally { }
        //export interface IOpenStatement extends IStatementNode { }
        //export interface IIdentifier extends IEntity {
        //    type: string;
        //}
        var OpenTypeScriptStatement = (function () {
            function OpenTypeScriptStatement() {
            }
            return OpenTypeScriptStatement;
        })();
        var OpenBraceConfigStatement = (function (_super) {
            __extends(OpenBraceConfigStatement, _super);
            function OpenBraceConfigStatement() {
                _super.apply(this, arguments);
            }
            return OpenBraceConfigStatement;
        })(OpenTypeScriptStatement);
        TypeScriptEntities.OpenBraceConfigStatement = OpenBraceConfigStatement;
        var TypeScriptSingleLineStatement = (function () {
            function TypeScriptSingleLineStatement() {
            }
            return TypeScriptSingleLineStatement;
        })();
        var OpenComment = (function (_super) {
            __extends(OpenComment, _super);
            function OpenComment() {
                _super.apply(this, arguments);
            }
            return OpenComment;
        })(OpenTypeScriptStatement);
        var JSDocComment = (function (_super) {
            __extends(JSDocComment, _super);
            function JSDocComment() {
                _super.apply(this, arguments);
            }
            return JSDocComment;
        })(OpenComment);
        var InterfaceFieldDefinition = (function (_super) {
            __extends(InterfaceFieldDefinition, _super);
            function InterfaceFieldDefinition() {
                _super.apply(this, arguments);
            }
            return InterfaceFieldDefinition;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.InterfaceFieldDefinition = InterfaceFieldDefinition;
        var InterfaceDeclaration = (function (_super) {
            __extends(InterfaceDeclaration, _super);
            function InterfaceDeclaration(name) {
                _super.call(this);
                this.name = name;
            }
            return InterfaceDeclaration;
        })(OpenBraceConfigStatement);
        TypeScriptEntities.InterfaceDeclaration = InterfaceDeclaration;
        var OpenConstDeclaration = (function (_super) {
            __extends(OpenConstDeclaration, _super);
            function OpenConstDeclaration(name) {
                _super.call(this);
                this.name = name;
            }
            return OpenConstDeclaration;
        })(OpenBraceConfigStatement);
        TypeScriptEntities.OpenConstDeclaration = OpenConstDeclaration;
        var ReturnBlock = (function () {
            function ReturnBlock() {
            }
            return ReturnBlock;
        })();
        TypeScriptEntities.ReturnBlock = ReturnBlock;
        var LambdaFieldOpenExpression = (function (_super) {
            __extends(LambdaFieldOpenExpression, _super);
            function LambdaFieldOpenExpression(block) {
                _super.call(this);
                this.block = block;
            }
            return LambdaFieldOpenExpression;
        })(OpenBraceConfigStatement);
        TypeScriptEntities.LambdaFieldOpenExpression = LambdaFieldOpenExpression;
        var InterfaceInstanceFieldOpenDeclaration = (function (_super) {
            __extends(InterfaceInstanceFieldOpenDeclaration, _super);
            function InterfaceInstanceFieldOpenDeclaration() {
                _super.apply(this, arguments);
            }
            return InterfaceInstanceFieldOpenDeclaration;
        })(OpenBraceConfigStatement);
        TypeScriptEntities.InterfaceInstanceFieldOpenDeclaration = InterfaceInstanceFieldOpenDeclaration;
        var OpenBracketConfigStatement = (function (_super) {
            __extends(OpenBracketConfigStatement, _super);
            function OpenBracketConfigStatement() {
                _super.apply(this, arguments);
            }
            return OpenBracketConfigStatement;
        })(OpenTypeScriptStatement);
        TypeScriptEntities.OpenBracketConfigStatement = OpenBracketConfigStatement;
        var ListDeclaration = (function (_super) {
            __extends(ListDeclaration, _super);
            function ListDeclaration() {
                _super.apply(this, arguments);
            }
            return ListDeclaration;
        })(OpenBraceConfigStatement);
        TypeScriptEntities.ListDeclaration = ListDeclaration;
        var OpenStringTemplate = (function () {
            function OpenStringTemplate() {
            }
            return OpenStringTemplate;
        })();
        TypeScriptEntities.OpenStringTemplate = OpenStringTemplate;
        var TypeAlias = (function (_super) {
            __extends(TypeAlias, _super);
            function TypeAlias() {
                _super.apply(this, arguments);
                this.pattern = 'type QName = RHS;';
            }
            return TypeAlias;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.TypeAlias = TypeAlias;
        var ModuleAlias = (function (_super) {
            __extends(ModuleAlias, _super);
            function ModuleAlias() {
                _super.apply(this, arguments);
            }
            return ModuleAlias;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.ModuleAlias = ModuleAlias;
        var StringConst = (function (_super) {
            __extends(StringConst, _super);
            function StringConst() {
                _super.apply(this, arguments);
            }
            return StringConst;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.StringConst = StringConst;
        var StringFieldInitializer = (function (_super) {
            __extends(StringFieldInitializer, _super);
            function StringFieldInitializer() {
                _super.apply(this, arguments);
            }
            return StringFieldInitializer;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.StringFieldInitializer = StringFieldInitializer;
        var NumberConst = (function (_super) {
            __extends(NumberConst, _super);
            function NumberConst() {
                _super.apply(this, arguments);
            }
            return NumberConst;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.NumberConst = NumberConst;
        var NumberFieldInitializer = (function (_super) {
            __extends(NumberFieldInitializer, _super);
            function NumberFieldInitializer() {
                _super.apply(this, arguments);
            }
            return NumberFieldInitializer;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.NumberFieldInitializer = NumberFieldInitializer;
        var SingleLineComment = (function (_super) {
            __extends(SingleLineComment, _super);
            function SingleLineComment() {
                _super.apply(this, arguments);
            }
            return SingleLineComment;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.SingleLineComment = SingleLineComment;
        var BooleanConst = (function (_super) {
            __extends(BooleanConst, _super);
            function BooleanConst() {
                _super.apply(this, arguments);
            }
            return BooleanConst;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.BooleanConst = BooleanConst;
        var BooleanFieldInitializer = (function (_super) {
            __extends(BooleanFieldInitializer, _super);
            function BooleanFieldInitializer() {
                _super.apply(this, arguments);
            }
            return BooleanFieldInitializer;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.BooleanFieldInitializer = BooleanFieldInitializer;
        var RequireStatement = (function (_super) {
            __extends(RequireStatement, _super);
            function RequireStatement() {
                _super.apply(this, arguments);
            }
            return RequireStatement;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.RequireStatement = RequireStatement;
        var EmptyStatement = (function (_super) {
            __extends(EmptyStatement, _super);
            function EmptyStatement() {
                _super.apply(this, arguments);
            }
            return EmptyStatement;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.EmptyStatement = EmptyStatement;
        var ArrowFunctionListItem = (function (_super) {
            __extends(ArrowFunctionListItem, _super);
            function ArrowFunctionListItem() {
                _super.apply(this, arguments);
            }
            return ArrowFunctionListItem;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.ArrowFunctionListItem = ArrowFunctionListItem;
        var ArrowFunctionField = (function (_super) {
            __extends(ArrowFunctionField, _super);
            function ArrowFunctionField() {
                _super.apply(this, arguments);
            }
            return ArrowFunctionField;
        })(TypeScriptSingleLineStatement);
        TypeScriptEntities.ArrowFunctionField = ArrowFunctionField;
        var ModuleOpenDeclaration = (function (_super) {
            __extends(ModuleOpenDeclaration, _super);
            function ModuleOpenDeclaration(name) {
                _super.call(this);
                this.name = name;
            }
            return ModuleOpenDeclaration;
        })(OpenBraceConfigStatement);
        TypeScriptEntities.ModuleOpenDeclaration = ModuleOpenDeclaration;
        var ConstInterfaceInstanceOpenDeclaration = (function (_super) {
            __extends(ConstInterfaceInstanceOpenDeclaration, _super);
            function ConstInterfaceInstanceOpenDeclaration(name) {
                _super.call(this);
                this.name = name;
            }
            return ConstInterfaceInstanceOpenDeclaration;
        })(OpenBraceConfigStatement);
        TypeScriptEntities.ConstInterfaceInstanceOpenDeclaration = ConstInterfaceInstanceOpenDeclaration;
    })(TypeScriptEntities = tsp.TypeScriptEntities || (tsp.TypeScriptEntities = {}));
})(tsp || (tsp = {}));
try {
    global.refs.ref = ['TypeScriptEntities', tsp.TypeScriptEntities];
}
finally { }
//# sourceMappingURL=TypeScriptEntities.js.map