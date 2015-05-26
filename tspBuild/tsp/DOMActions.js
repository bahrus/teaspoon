var tsp;
(function (tsp) {
    var DOMActions;
    (function (DOMActions) {
        try {
            require('./Refs');
            global.refs.moduleTarget = tsp;
        }
        finally { }
        var fsa = tsp.FileSystemActions;
        var ca = tsp.CommonActions;
        var pa = tsp.ParserActions;
        function remove(action, context, callback) {
            action.state.element.remove();
            ca.endAction(action, callback);
        }
        DOMActions.remove = remove;
        function addToJSClob(action, context, callback) {
            var state = action.state;
            var src = action.state.element.attr('src');
            var referringDir = context.fileManager.resolve(state.htmlFile.filePath, '..', src);
            if (!context.JSOutputs)
                context.JSOutputs = {};
            var jsOutputs = context.JSOutputs;
            if (!jsOutputs[referringDir])
                jsOutputs[state.htmlFile.filePath] = [];
            var minifiedVersionFilePath = pa.replaceEndWith(referringDir, '.js', '.min.js');
            if (!context.fileManager.doesFilePathExist(minifiedVersionFilePath)) {
                console.log('minified filepath ' + minifiedVersionFilePath + ' does not exist.');
                ca.endAction(action, callback);
                return;
            }
            var minifiedContent = context.fileManager.readTextFileSync(minifiedVersionFilePath);
            jsOutputs[state.htmlFile.filePath].push(minifiedContent);
            action.state.element.remove();
            ca.endAction(action, callback);
        }
        DOMActions.addToJSClob = addToJSClob;
        function selectElements(action, context, callback) {
            if (action.debug)
                debugger;
            var aS = action.state;
            if (aS.relativeTo) {
                aS.elements = aS.relativeTo.find(action.cssSelector);
            }
            else {
                //aS.elements = aS.$(action.cssSelector);
                aS.elements = aS.htmlFile.$(action.cssSelector);
            }
            ca.endAction(action, callback);
        }
        DOMActions.selectElements = selectElements;
        function DOMTransform(action, context, callback) {
            var elements;
            var p;
            if (action.state) {
                p = action.state.parent;
            }
            var aSel = action.selector;
            if (!aSel.state) {
                aSel.state = {
                    htmlFile: action.state.htmlFile,
                };
            }
            var aSelSt = aSel.state;
            aSelSt.treeNode = action;
            if (p && p.elementAction) {
                aSelSt.relativeTo = p.elementAction.state.element;
            }
            aSel.do(aSel, context);
            var eA = action.elementAction;
            if (eA) {
                //#region element Action
                eA.state = {
                    element: null,
                    DOMTransform: action,
                    htmlFile: aSelSt.htmlFile,
                };
                if (eA.async) {
                    var i = 0;
                    var n = aSelSt.elements.length;
                    var eACallback = function (err) {
                        if (i < n) {
                            var $elem = aSelSt.htmlFile.$(aSelSt.elements[i]);
                            i++;
                            eA.state.element = $elem;
                            eA.do(eA, context, eACallback);
                        }
                        else {
                            ca.endAction(action, callback);
                        }
                    };
                    eACallback(null);
                }
                else {
                    var n = aSelSt.elements.length;
                    for (var i = 0; i < n; i++) {
                        var $elem = aSelSt.htmlFile.$(aSelSt.elements[i]);
                        eA.state.element = $elem;
                        eA.do(eA, context);
                    }
                    ca.endAction(action, callback);
                }
            }
            else {
                ca.endAction(action, callback);
            }
        }
        DOMActions.DOMTransform = DOMTransform;
        function ApplyDOMTransformsOnHTMLFiles(action, context, callback) {
            var htmlFiles = action.htmlFiles;
            var domTransforms = action.domTransforms;
            for (var i = 0, n = htmlFiles.length; i < n; i++) {
                var htmlFile = htmlFiles[i];
                for (var j = 0, m = domTransforms.length; j < m; j++) {
                    var domTransform = domTransforms[j];
                    domTransform.state = {
                        htmlFile: htmlFile,
                    };
                    domTransform.do(domTransform, context, null);
                }
            }
        }
        DOMActions.ApplyDOMTransformsOnHTMLFiles = ApplyDOMTransformsOnHTMLFiles;
    })(DOMActions = tsp.DOMActions || (tsp.DOMActions = {}));
})(tsp || (tsp = {}));
try {
    global.refs.ref = ['DOMActions', tsp.DOMActions];
}
finally { }
//# sourceMappingURL=DOMActions.js.map