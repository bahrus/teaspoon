declare var mode: string;

// Type definitions for the DOM Mutation Observers API
// http://dom.spec.whatwg.org/#mutation-observers


module tsp {

    export var prefix = 'tsp-';

    var reserved_lazyLoad = 'reserved_lazyLoad';

    var cache = [{}],
        expando = 'data-tsp-cache';

    function trim(s) {
        if (s.trim) return s.trim();
        var l = 0; var r = s.length - 1;
        while (l <= r && s[l] == ' ')
        { l++; }
        while (r > l && s[r] == ' ')
        { r -= 1; }
        return s.substring(l, r + 1);
    }


    function data(elem: HTMLElement): any {
        var cacheIndex = elem.getAttribute(expando), nextCacheIndex = cache.length;
        var nCacheIndex : number;
        if (!cacheIndex) {
            elem.setAttribute(expando, nextCacheIndex.toString());
            cache[nextCacheIndex] = {};
            nCacheIndex = nextCacheIndex;
        } else {
            nCacheIndex = parseInt(cacheIndex);
        }
        
        return cache[nCacheIndex];
    }
    
    export interface ICascadingRule {
        selectorText: string;
        properties: { [key: string]: any; };
        docOrder: number;
    }

    export interface ICascadingHandler {
        selectorText: string;
        handler: (evt: Event) => void;
    }

  

    export interface IConditionalRule {
        condition?: (el: HTMLElement) => boolean;
        actionIfTrue?: (el: HTMLElement) => void;
        actionIfFalse?: (el: HTMLElement) => void;
    }

    export interface IMergeCallOptions<T> {
        prefix?: string;
        call?: (el: HTMLElement, props: { [key: string]: any; }) => void;
        options?: T;
        callLabel?: string;
    }

    export interface ILazyLoadRule {
        applyLazyConditionCheck?: (el: HTMLElement) => boolean;
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
    var rulesIdx = 0;

    var uidIdx = 0;

    export function _if(selectorText: string, props: { [key: string]: any; }) : typeof tsp {
        rules[rulesIdx++] = {
            selectorText: selectorText,
            properties: props,
            docOrder: rulesIdx,
        };
        return tsp;
    }

    var handlers: { [key: string]: ICascadingHandler[]; } = {};

    export function _when(eventName: string, cascadingHandler: ICascadingHandler) {
        if (!isClientSideMode()) return;
        var eventHandlers = handlers[eventName];
        if (!eventHandlers) {
            eventHandlers = [];
            handlers[eventName] = eventHandlers;
            var body = document.body;
            if (body.attachEvent) {
                body.attachEvent('on' + eventName, handleCascadingEvent);
            } else {
                body.addEventListener(eventName, handleCascadingEvent);
            }
        }
        eventHandlers[eventHandlers.length] = cascadingHandler;
    }

    function handleCascadingEvent(evt: Event) {
    } 
    

    export function applyRules(doc: HTMLDocument) {
        var affectedEls: { [key: string]: HTMLElement; } = {};
        //#region apply cascading rules
        //TODO:  sort the rules according to precedence as described here: http://www.vanseodesign.com/css/css-specificity-inheritance-cascaade/
        for (var i = 0; i < rulesIdx; i++) {
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
        if (isClientSideMode()) {
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
        } else {
        }
        
        //#endregion
    }

    function isClientSideMode() {
        return typeof (mode) == 'undefined' || mode !== 'server'
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
   
    export function lazyLoad(el: HTMLElement, props: { [key: string]: any; }, doc: HTMLDocument) {
        if (isClientSideMode()) return;
        var lazyRule = <ILazyLoadRule> evalRulesSubset(props, prefix);
        if (lazyRule.applyLazyConditionCheck) {
            if (!lazyRule.applyLazyConditionCheck(el)) return;
        }
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

    export function createInputAutoFillRule(model: any) {
        var modelRoot = <IHttpContext> model['httpContext'];
        var fillRule: IFill<IHttpContext> = {
            modelRootElement: modelRoot,
            valProp: 'value',
            fill: (el: HTMLElement , mdl : IHttpContext) => getValFromRequest(<HTMLInputElement> el, mdl.Request),
        };
        _if('form > input[type="text"]', createFillRule<IHttpContext>(fillRule).mergedObject); 
    }

    export function createFillRule<TModel>(fillRule: IFill<TModel>) {
        var fillObj = tsp.beginMerge<IFill<TModel>>({
            call: applyFillRule,
            prefix: prefix,
            options: fillRule,
        });
        return fillObj;
    }

    export function applyFillRule<TModel>(el: HTMLElement, props: { [key: string]: any; }) {
        var fillRule = <IFill<TModel>> evalRulesSubset(props, prefix);
        var model = fillRule.modelRootElement;
        var val = fillRule.fill(el, model);
        var valProp = fillRule.valProp;
        switch (fillRule.valProp) {
            case 'innerHTML':
                el.innerHTML = val;
                break;
            case 'value':
                el[valProp] = val;
                break;
            default:
                el.setAttribute(valProp, val);
        }
    }

    export function applyConditionalRule(el: HTMLElement, props: { [key: string]: any; }) {
        var conditionalRule = <IConditionalRule> evalRulesSubset(props, prefix);
        if (!conditionalRule.condition) return;
        
        var test = conditionalRule.condition(el);
        if (test && conditionalRule.actionIfTrue) {
            conditionalRule.actionIfTrue(el);
        } else if (!test && conditionalRule.actionIfFalse) {
            conditionalRule.actionIfFalse(el);
        }
    }

    export interface IAction {
        action: (el: HTMLElement) => void;
    }

    export function applyActionRule(el: HTMLElement, props: { [key: string]: any; }) {
        var actionRule = <IAction> evalRulesSubset(props, prefix);
        actionRule.action(el);
    }

    export interface IAttributeSet {
        name: string;
        value: any;
    }

    

    export interface IFill<TModel> {
        valProp?: string; //example:  'value', 'innerHTML', 'class'
        modelRootElement?: TModel;
        fill?: (el: HTMLElement, model: TModel) => string;
    }

    export function applyAttributeRule(el: HTMLElement, props: { [key: string]: any; }) {
        var attrRule = <IAttributeSet> evalRulesSubset(props, prefix);
        var sVal = attrRule.value;
        if (typeof (sVal) == 'function') {
            sVal = sVal();
        } else if (typeof (sVal) != 'string') {
            sVal = '' + sVal;
        }
        if (el.getAttribute(attrRule.name) != sVal) {
            el.setAttribute(attrRule.name, sVal);
        }
    }

    function getValFromRequest(ie: HTMLInputElement, req: IHttpRequest) : string {
        return req.Params[ie.name];
    }

    export interface IHttpContext {
        Request: IHttpRequest
    }

    export interface IHttpRequest {
        Params: { [key: string]: string; };
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