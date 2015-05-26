var tsp;
(function (tsp) {
    var DOMBuildDirectives;
    (function (DOMBuildDirectives) {
        try {
            require('./Refs');
            global.refs.moduleTarget = tsp;
        }
        finally { }
        DOMBuildDirectives.domBuildConfig = {
            removeBuildDirective: {
                do: tsp.DOMActions.DOMTransform,
                selector: {
                    cssSelector: 'tsp-design-time',
                    do: tsp.DOMActions.selectElements,
                },
                elementAction: {
                    do: tsp.DOMActions.remove,
                },
            },
            makeJSClobDirective: {
                do: tsp.DOMActions.DOMTransform,
                selector: {
                    cssSelector: 'head>script[src]',
                    do: tsp.DOMActions.selectElements,
                },
                elementAction: {
                    do: tsp.DOMActions.addToJSClob,
                },
            },
            subActionsGenerator: [
                function (i) { return i.removeBuildDirective; },
                function (i) { return i.makeJSClobDirective; }
            ],
        };
    })(DOMBuildDirectives = tsp.DOMBuildDirectives || (tsp.DOMBuildDirectives = {}));
})(tsp || (tsp = {}));
try {
    global.refs.ref = ['DOMBuildDirectives', tsp.DOMBuildDirectives];
}
finally { }
//# sourceMappingURL=DOMBuildDirectives.js.map