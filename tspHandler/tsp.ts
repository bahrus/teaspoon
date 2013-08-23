module tsp {

    export var clientSideProcessor = 'tsp-csx';

    export interface ICssRule {
        selectorText: string;
        style: { [key: string]: string; };
    }

    export function applyStyles(doc: HTMLDocument) {
        var styS = doc.styleSheets;
        for (var i = 0, n = styS.length; i < n; i++) {
            var styleSheet = styS[i];
            var rules = <ICssRule[]> (styleSheet['rules'] || styleSheet['cssRules']);
            for (var i = 0, n = rules.length; i < n; i++) {
                var rule = rules[i];
                var csx = rule.style[clientSideProcessor];
                if (csx) {
                    var fn = eval(csx);
                    if (typeof (fn) === 'string') fn = eval(fn);
                    fn(rule, doc);
                }
            }
        }
    }
}