declare var mode: string;

// Type definitions for the DOM Mutation Observers API
// http://dom.spec.whatwg.org/#mutation-observers


module tsp {

    export var prefix = 'tsp-';

    var reserved_lazyLoad = 'reserved_lazyLoad';

    var cache = [{}],
        expando = 'data' + +new Date();

    function trim(s) {
        if (s.trim) return s.trim();
        var l = 0; var r = s.length - 1;
        while (l <= r && s[l] == ' ')
        { l++; }
        while (r > l && s[r] == ' ')
        { r -= 1; }
        return s.substring(l, r + 1);
    }


    function data(elem: HTMLElement) : any {
        var cacheIndex = elem[expando], nextCacheIndex = cache.length;
        if (!cacheIndex) {
            cacheIndex = elem[expando] = nextCacheIndex;
            cache[cacheIndex] = {};
        }
        return cache[cacheIndex];
    }
    
    export interface ICascadingRule {
        selectorText: string;
        properties: { [key: string]: any; };
        docOrder: number;
    }

    export interface IMergeCallOptions<T> {
        prefix?: string;
        call?: (el: HTMLElement, props: { [key: string]: any; }) => void;
        options?: T;
        callLabel?: string;
    }

    export interface IObjectMerge {
        mergedObject: { [key: string]: any; };
        merge<T>(prifix: string, obj: T);
    }

    export class ObjectMerge implements IObjectMerge {
        mergedObject: { [key: string]: any; };
        merge<T>(callOpts: IMergeCallOptions<T>) {
            var prefix = callOpts.prefix ? callOpts.prefix : '';
            var obj = callOpts.options;
            if (obj) {
                for (var prop in callOpts.options) {
                    var sProp = <string> prop;
                    this.mergedObject[prefix + sProp] = obj[prop];
                }
            }
            var sCall = callOpts.callLabel ? callOpts.callLabel : 'call';
            if (callOpts.call) this.mergedObject[sCall] = callOpts.call;
        }
        constructor(mergedObject: { [key: string]: any; }) {
            this.mergedObject = mergedObject;
        }
    }

    export function beginMerge<T>(callOpts: IMergeCallOptions<T>) : ObjectMerge {
        var mergedObject: { [key: string]: any; } = {};
        var om = new ObjectMerge(mergedObject);
        om.merge(callOpts);
        return om;
    }

    


    var rules: ICascadingRule[] = [];
    var currIdx = 0;

    var uidIdx = 0;

    export function _if(selectorText: string, props: { [key: string]: any; }) : typeof tsp {
        rules[currIdx++] = {
            selectorText: selectorText,
            properties: props,
            docOrder: currIdx,
        };
        return tsp;
    }

    

    export function applyRules(doc: HTMLDocument) {
        var affectedEls: { [key: string]: HTMLElement; } = {};
        //#region apply cascading rules
        //TODO:  sort the rules according to precedence as described here: http://www.vanseodesign.com/css/css-specificity-inheritance-cascaade/
        console.log('currIdx = ' + currIdx);
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
                console.log(nd.id);
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
                        if (sKey.substr(0, 4) === 'call') {
                            if (sKey.length == 4) {
                                sKey += uidIdx++;
                            }
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
                        fn(nd, data(nd).tsp, doc);
                    }
                }
            }
        }
        //#endregion
        //#region perform reserved rules
        if (typeof (mode) == 'undefined' || mode !== 'server') {
            var nds = doc.querySelectorAll('.' + reserved_lazyLoad);
            for (var j = 0, n = nds.length; j < n; j++) {
                var nd = <HTMLElement> nds[j];
                if (typeof (MutationObserver) !== 'undefined') {
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
                } else if (nd.attachEvent) {
                    //TODO:  deprecate eventually - ie 10 and earlier
                    nd.attachEvent('onpropertychange', handleOnPropertyChange);
                }
            }
        }
        
        //#endregion
    }

    function handleOnPropertyChange(ev: Event) {
        if(ev['propertyName'] !== 'style.display') return;
        handleStyleDisplayChangeEventForLazyLoadedElement(<HTMLElement> ev.srcElement);
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
        var conditionalRule = <IConditionalRule> evalRulesSubset(props, prefix);
        var test = conditionalRule.condition(el);
        if (test && conditionalRule.actionIfTrue) {
            conditionalRule.actionIfTrue(el);
        } else if (!test && conditionalRule.actionIfFalse) {
            conditionalRule.actionIfFalse(el);
        }
    }

    export function lazyLoad(el: HTMLElement, props: { [key: string]: any; }, doc: HTMLDocument) {
        if (typeof (mode) == 'undefined' || mode !== 'server') return;
        var ndHidden = doc.createElement('script');
        var sOriginalID = el.id;
        el.setAttribute('data-originalID', sOriginalID);
        el.id = el.id + '_temp';
        ndHidden.setAttribute('type', 'text/html');
        ndHidden.className = reserved_lazyLoad;
        var inserted = <HTMLElement> el.parentNode.insertBefore(ndHidden, el);
        inserted.appendChild(el);
        //inserted.setAttribute('id', sOriginalID);
        inserted.id = sOriginalID;
    }

    function handleStyleDisplayChangeEventForLazyLoadedElement(el: HTMLElement) {
        var sNewValue = el.style.display;
        var sOldValue = data(el).tsp_display;
        if (!sOldValue) sOldValue = 'none';
        if (sNewValue == sOldValue) return;
        if (el.detachEvent) {
            el.detachEvent('onpropertychange', handleOnPropertyChange);
        }
        data(el).tsp_display = sNewValue;
        if (!data(el).tsp_lazyloaded && (sNewValue !== 'none')) {
            el.insertAdjacentHTML('beforebegin', trim(el.innerHTML));
        }
        var newElement = (<HTMLElement> el.previousSibling);
        newElement.style.display = sNewValue;
        newElement.id = newElement.getAttribute('data-originalID');
        el.parentNode.removeChild(el);
    }

    export function createConditionalRule(conditionalRule: IConditionalRule) {
        var conditionObj = tsp.beginMerge<tsp.IConditionalRule>({
            call: applyConditionalRule,
            prefix: prefix,
            options: conditionalRule,
        });
        return conditionObj;
    }

    export interface IConditionalRule {
        condition?: (el?:HTMLElement) => boolean;
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