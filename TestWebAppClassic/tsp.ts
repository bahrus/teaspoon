declare var mode: string;

// Type definitions for the DOM Mutation Observers API
// http://dom.spec.whatwg.org/#mutation-observers



declare var MutationObserver: {
  prototype: MutationObserver;
  new(callback:(records:MutationRecord[])=>any): MutationObserver;
}

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

    export function addEventHandler(elem, eventType, handler) {
        if (elem.addEventListener)
            elem.addEventListener(eventType, handler, false);
        else if (elem.attachEvent)
            elem.attachEvent('on' + eventType, handler);
    }
    
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

    export function lazyLoad(el: HTMLElement, props: { [key: string]: any; }) {
        if (typeof (mode) == 'undefined' || mode !== 'server') {
            //#region observe change to style.display
            if (typeof(MutationObserver) !== 'undefined') {
                //var observer = new MutationObserver( (mrs : MutationRecord[]) => {
                //    // Handle mutations
                //    for (var i = 0, n = mrs.length; i < n; i++) {
                //        var mr = mrs[i];
                //        if (mr.attributeName !== 'style') continue;
                        
                //        handleStyleDisplayChangeEventForLazyLoadedElement(<HTMLElement> mr.target);
                //        break;
                //    }
                //});
                //observer.observe(el, {  
                //    attributes: true,
                //});
            } else if (el.attachEvent) {
                //TODO:  deprecate eventually
                el.attachEvent('onpropertychange', function (ev: Event) {
                    handleStyleDisplayChangeEventForLazyLoadedElement(<HTMLElement> ev.srcElement);
                });
            }
            //#endregion
        }
    }

    function handleStyleDisplayChangeEventForLazyLoadedElement(el: HTMLElement) {
        var sNewValue = el.style.display;
        var sOldValue = data(el).tsp_display;
        if (!sOldValue) sOldValue = 'none';
        data(el).tsp_display = sNewValue;
        if (!data(el).tsp_lazyloaded && (sNewValue !== 'none')) {
            el.insertAdjacentHTML('beforebegin', el.innerHTML.trim());
            el.innerHTML = '';
        }
        (<HTMLElement> el.previousSibling).style.display = sNewValue;
    }

    

    export interface IConditionalRule {
        condition: (el?:HTMLElement) => boolean;
        actionIfTrue?: (el?:HTMLElement) => void;
        actionIfFalse?: (el?:HTMLElement) => void;
    }


}

module tsp.util {
    function parse_selector(selector: string) {
        var simple_selectors = []
        // Split by the group operator ','
        var commaDelimitedSelectors = selector.split(',');
        // Split each selector group by combinators ' ', '+', '~', '>'
        // :not() is a special case, do not include it as a pseudo-class

        // For the selector div > p:not(.foo) ~ span.bar,
        // sample output is ['div', 'p', '.foo', 'span', '.bar']
        return simple_selectors;
    }

    interface ISelectorCount {
        isInline: boolean;
        noOfIds: number;
        noOfClassOrAttributeOrPseudoClasses: number;
        noOfContextual
    }

}