declare var mode: string;
declare var data: any;

// from  http://james.padolsey.com/javascript/element-datastorage/ :

// WITHOUT ENCAPSULATION:
//(function () {

//    var cache = [{}],
//        expando = 'data' + +new Date();

//    function data(elem : HTMLElement) {

//        var cacheIndex = elem[expando], nextCacheIndex = cache.length;

//        if (!cacheIndex) {
//            cacheIndex = elem[expando] = nextCacheIndex;
//            cache[cacheIndex] = {};
//        }

//        return cache[cacheIndex];

//    }

//    window['data'] = data;

//})();

module tsp {

    var cache = [{}],
        expando = 'data' + +new Date();

    function data(elem: HTMLElement) : any {

        var cacheIndex = elem[expando], nextCacheIndex = cache.length;

        if (!cacheIndex) {
            cacheIndex = elem[expando] = nextCacheIndex;
            cache[cacheIndex] = {};
        }

        return cache[cacheIndex];

    }

    //window['data'] = data;

    //export var clientSideProcessor = 'tsp-csx';
    //export var serverSideProcessor = 'tsp-ssx';
    //export var dualSideProcessor = 'tsp-dsx';
    export var processor = 'tsp-processor';
    export var processorScope = 'tsp-scope';
    export var processorScopeLocal = 'tsp-scope-local';

    export interface ICascadingRule {
        selectorText: string;
        properties: { [key: string]: any; };
        docOrder: number;
    }

    var rules: ICascadingRule[] = [];
    var currIdx = 0;

    var uidIdx = 0;

    export function push(selectorText: string, props: { [key: string]: any; }) {
        rules[currIdx++] = {
            selectorText: selectorText,
            properties: props,
            docOrder: currIdx,
        };
    }

    export function applyRules(doc: HTMLDocument) {
        var affectedEls: { [key: string]: HTMLElement; } = {};
        //#region apply cascading rules
        //TODO:  sort the rules according to precedence as described here: http://www.vanseodesign.com/css/css-specificity-inheritance-cascaade/
        for (var i = 0; i < currIdx; i++) {
            //#region iterate over all the rules
            var rule = rules[i];
            var nds = doc.querySelectorAll(rule.selectorText);
            for (var j = 0, n = nds.length; j < n; j++) {
                //#region iterate over all the matching elements
                var nd = <HTMLElement> nds[j];
                if (!nd.id) {
                    nd.id = 'tsp_' + uidIdx++;
                }
                affectedEls[nd.id] = nd;
                var tsp_props: { [key: string]: any; } = data(nd).tsp;
                if (!tsp_props) {
                    tsp_props = {};
                    data(nd).tsp = tsp_props; 
                }
                var exe_props: { [key: string]: any; } = data(nd).exe;
                if (!exe_props) {
                    exe_props = {};
                    data(nd).exe = exe_props;
                }
                var props = rule.properties;
                for (var key in props) {
                    if (props.hasOwnProperty(key)) {
                        var sKey = <string> key;
                        if (sKey.substr(0, 4) === 'exe-') {
                            exe_props[sKey] = props[key];
                        } else {
                            tsp_props[sKey] = props[key];
                        }
                    }
                }
                //#endregion
            }
            //#endregion
        }
        //#endregion
        //#region execute rules
        for (var key in affectedEls) {
            if (affectedEls.hasOwnProperty(key)) {
                var nd = affectedEls[key];
                var exes = <{ [key: string]: any; } > data(nd).exe;
                for (var key2 in exes) {
                    if (exes.hasOwnProperty(key2)) {
                        var fn = exes[key2];
                        if (typeof (fn) === 'string') {
                            fn = eval(fn);
                        }
                        fn(nd, data(nd).tsp);
                    }
                }
            }
        }
        //#endregion
    }

    

    export function evalRulesSubset(props: { [key: string]: any; }, prefix: string) : any {
        var returnObj = {};
        for (var key in props) {
            if (props.hasOwnProperty(key)) {
                var sKey = <string> key;
                if (sKey.substr(0, prefix.length) !== prefix) continue;
                sKey = sKey.substr(prefix.length);
                var sKeyLHS = sKey.replace('-', '_');
                returnObj[sKeyLHS] = props[key];
            }
        }
        return returnObj;
    }

    

    export function applyConditionalRule(el: HTMLElement, props: { [key: string]: any; }) {
        var conditionalRule = <IConditionalRule> evalRulesSubset(props, 'tsp-');
        var test = conditionalRule.condition(el);
        if (test && conditionalRule.actionIfTrue) {
            conditionalRule.actionIfTrue(el);
        } else if (!test && conditionalRule.actionIfFalse) {
            conditionalRule.actionIfFalse(el);
        }
    }

    //export interface IProcessingRule {
    //    processor: string;
    //    processorScope? : string;
    //}

    export interface IConditionalRule {
        condition: (el?:HTMLElement) => boolean;
        actionIfTrue?: (el?:HTMLElement) => void;
        actionIfFalse?: (el?:HTMLElement) => void;
    }


}