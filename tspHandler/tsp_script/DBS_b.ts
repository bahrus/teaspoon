///<reference path='emmet.d.ts'/>

declare var mode: string;
module DBS.b{

    export function isCSMode() : boolean {
        return (typeof (mode) == 'undefined' || mode !== 'server');
    }

    //export function isClientSideMode() {
    //    return typeof (mode) == 'undefined' || mode !== 'server'
    //}

    var uidCounter = 0;

    export function getOrCreateID(el: HTMLElement) {
        if (!el.id) {
            el.id = 'DBS_' + uidCounter++;
        }
        return el.id;
    }

    export var dataExpando = isCSMode() ? 'data-cs-cache' : 'data-ss-cache';
    var cache = [{}];
    export function data(elem: HTMLElement): any {
        //var $el = $(elem);
        var cacheIndex = elem.getAttribute(dataExpando), nextCacheIndex = cache.length;
        //var cacheIndex = $el.attr(expando), nextCacheIndex = cache.length;
        var nCacheIndex: number;
        if (!cacheIndex) {
            elem.setAttribute(dataExpando, nextCacheIndex.toString());
            //$el.attr(dataExpando, nextCacheIndex.toString());
            //elem.setAttribute(expando, nextCacheIndex.toString());
            cache[nextCacheIndex] = {};
            nCacheIndex = nextCacheIndex;
        } else {
            nCacheIndex = parseInt(cacheIndex);

        }
        if (!cache[nCacheIndex]) cache[nextCacheIndex] = {};
        return cache[nCacheIndex];
    }

    //export function subBefore(val: string, search: string): ISearchBeforeResult {
    //    var iPos = val.indexOf(search);
    //    return {
    //        val: val,
    //        cursor: iPos,
    //        result: iPos == -1 ? val : val.substr(0, iPos)
    //    };
    //}

    //export function subAfter(sbr: ISearchBeforeResult, seatch: string) {

    //}

    //export interface ISearchBeforeResult {
    //    val: string;
    //    cursor: number;
    //    result: string;
    //}

    //export function partSplit(val: string, delim: string, num: number) {
    //    var sp: string[] = [];
    //    var i = 0, n = val.length, currLen = 0;
    //    while (i < n) {
    //        var c = val.charAt(i);
    //        i++;
    //    }

    //}

    //export function divideString(val: string, search: string): IDividedString{
    //    var iPos = val.indexOf(search);
    //    return {
    //        before: iPos == -1 ? val : val.substr(0, iPos),
    //        after: iPos == -1 ? '' : val.substr(iPos + search.length),
    //    };
    //}

    export interface IDividedString {
        before: string;
        after: string;
    }

    export interface IPropsManager {
        el?: HTMLElement;
        emmetString?: string;
        tagName?: string;
        attr?: { [name: string]: string };
        addClassList?: string[];
        $?: (props: IPropsManager) => IPropsManager;
        appendTo?: (parent: HTMLElement) => IPropsManager;
        text?: string;
    }

    export function $$(emmetS: string): IPropsManager {
        //var headTail = divideString(emmetS, '>');
        //var el = document.createElement(headTail.before);
        //el.innerHTML = expEmmet(headTail.after);
        ////var expand = emmet.expandAbbreviation(
        //var props : IPropsManager =  {
        //    el: el,
        //};
        var props: IPropsManager = { emmetString: emmetS };
        applyMethods(props);
        return props;
    }

    function applyMethods(props: IPropsManager) {
        if (!props.$) props.$ = partial($, props);
        if (!props.appendTo) props.appendTo = partial(appendTo, props);
    }

    export function format(str: string, props: any) {
        var res = str;
        for (var key in props) {
            res = res.replace('{' + key + '}', props[key]);
        }
        return res;
    }

    export function $(props: IPropsManager) {
        var pa = props.attr, el = props.el, acl = props.addClassList;
        if (!el) {
            var tn = props.tagName;
            if (tn) {
                props.el = document.createElement(tn);
                el = props.el;
            }
        }
        if (pa ){
            for (var a in pa) {
                el.setAttribute(a, pa[a]);
            }
        }
        if (acl) {
            var cl = el.classList;
            for (var i = 0, n = acl.length; i < n; i++) {
                var ac = acl[i];
                if (!cl.contains(ac)) cl.add(ac);
            }
        }
        if (props.text) {
            el.textContent = props.text;
        }
        applyMethods(props);
        return props;
    }

    function appendTo(props: IPropsManager, parent: HTMLElement): IPropsManager {
        if (props.el) {
            parent.appendChild(props.el);
            return props;
        }
        if (props.emmetString) {
            parent.insertAdjacentHTML('beforeend', expEmmet(props.emmetString));
        }
    }

    function expEmmet(str: string) {
        return emmet.expandAbbreviation(str, 'html', 'html', null).split('${0}').join('');
    }

    export function applyEmmet(selectedNode: NodeSelector) {
        var cs = isCSMode();
        var emmetSelector = 'script[type="text/emmet"][data-mode="';
        if (cs) {
            emmetSelector += 'client-side-only';
        } else {
            emmetSelector += 'server-side-only'
        }
        emmetSelector += '"]';
        var emmetNodes = selectedNode.querySelectorAll(emmetSelector);
        for (var i = 0, n = emmetNodes.length; i < n; i++) {
            var nd = <HTMLElement> emmetNodes[i];
            var inner = nd.innerHTML.trim();
            var content = expEmmet(inner);
            //var templ = nd.getAttribute('data-processor');
            //if (templ) {
            //    var fn = eval(templ);
            //    content = fn(content);
            //}
            nd.insertAdjacentHTML('beforebegin', content);
            var prevSibling = <HTMLElement> nd.previousSibling;
            nd.parentNode.removeChild(nd);

        }
    }

     

    export function MakeRCsUnique(el: HTMLElement) {
        var rcELS = el.querySelectorAll('*[data-rc]');
        var row = 0;
        for (var i = 0, n = rcELS.length; i < n; i++) {
            var rcEL = <HTMLElement> rcELS[i];
            var rc = rcEL.getAttribute('data-rc');
            if (rc == 'r,1') {
                row++;
            }
            rc = rc.replace('r,', row + ',');
            rcEL.setAttribute('data-rc', rc);
        }
    }

    export function extractDirective<T>(el: HTMLElement, prop: string): any {
        //var $el = $(el);
        var d = <T> DBS.b.data(el)[prop];
        if (d) return d;
        var attName = 'data-' + toSnakeCase(prop);
        var da = el.getAttribute(attName);
        if (da) {
            return eval('(' + da + ')');
        }
    }

    var lcUpRegExp = /([a-z])([A-Z])/g;
    export function toSnakeCase(s: string) {
        return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    //export interface INotifyListeners{
    //    //addChangeListener<T>(callBack: (T) => void);
    //    changeListeners?: { (t: any): void }[];
    //    addChangeListener:  function(callBack: (a: any => void));
    //}

    export class ChangeNotifier<T>{
        _changeListeners: { (t: T): void }[];
        constructor() {
            this._changeListeners = [];
        }
        addChangeListener(callBack: (t: T) => void) {
            this._changeListeners.push(callBack);
        }
        notifyListeners(t: T) {
            console.log('DBS.b.notifyListeners');
            var cls = this._changeListeners;
            if (!cls) return;
            for (var i = 0, n = cls.length; i < n; i++) {
                var cl = cls[i];
                cl(t);
            }
        }
    }

    //export function attachNotifyListeners<T extends INotifyListeners>(t: T) {
    //    console.log('DBS.b.attachNotifyListeners');
    //    t.addChangeListener = partial(addChangeListener, t);
    //}

    //function addChangeListener<T extends INotifyListeners>(t: T, callBack: (T) => void) {
    //    if (!t.changeListeners) t.changeListeners = [];
    //    console.log('DBS.b.addChangeListener');
    //    t.changeListeners.push(callBack);
    //}

    //export function notifyListeners(listenerContainer: INotifyListeners) {
    //    console.log('DBS.b.notifyListeners');
    //    var cls = listenerContainer.changeListeners;
    //    if (!cls) return;
    //    for (var i = 0, n = cls.length; i < n; i++) {
    //        var cl = cls[i];
    //        cl(listenerContainer);
    //    }
    //}

    function partial(func, arg1?, arg2?, arg3?, arg4?, arg5?, arg6?, arg7?) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            var allArguments = args.concat(Array.prototype.slice.call(arguments));
            return func.apply(this, allArguments);
        };
    }
} 