///<reference path='jQueryFacade.d.ts'/>
///<reference path='tcp.ts'/>
///<reference path='emmet.d.ts'/>

declare var mode: string;
declare var jQueryServerSideFacade: JQueryStaticFacade;

// Type definitions for the DOM Mutation Observers API
// http://dom.spec.whatwg.org/#mutation-observers


module tsp {

    export var prefix = 'tsp-';

    //#region jquery facade

    export var $: JQueryStaticFacade;

    export var reserved_lazyLoad = 'reserved_lazyLoad';

    if (!isClientSideMode()) {
        $ = jQueryServerSideFacade.jQuery;
        $.trim = (s: string) => $().trim(s);
    } else {
        $ = <JQueryStaticFacade> eval('jQuery');
    }

    var cache = [{}];
    export var dataExpando = isClientSideMode() ? 'data-tcp-cache' : 'data-tsp-cache';


    export function data(elem: HTMLElement): any {
        var $el = $(elem);
        var cacheIndex = elem.getAttribute(dataExpando), nextCacheIndex = cache.length;
        //var cacheIndex = $el.attr(expando), nextCacheIndex = cache.length;
        var nCacheIndex : number;
        if (!cacheIndex) {
            $el.attr(dataExpando, nextCacheIndex.toString());
            //elem.setAttribute(expando, nextCacheIndex.toString());
            cache[nextCacheIndex] = {};
            nCacheIndex = nextCacheIndex;
        } else {
            nCacheIndex = parseInt(cacheIndex);
            
        }
        if(!cache[nCacheIndex]) cache[nextCacheIndex] = {};
        return cache[nCacheIndex];
    }

    //#endregion
    
    //#region Interfaces

    export interface IAction {
        action: (el: HTMLElement) => void;
    }

    export interface IAttributeSet {
        name: string;
        value: any;
    }

    export interface ICascadingRule {
        selectorText: string;
        properties: { [key: string]: any; };
        docOrder: number;
    }

    export interface IConditionalRule {
        condition?: (el: HTMLElement) => boolean;
        actionIfTrue?: (el: HTMLElement) => void;
        actionIfFalse?: (el: HTMLElement) => void;
    }

    export interface IDataField {
        name?: string;
        isPrimaryKey?: boolean;
        isTreeNodeInfo?: boolean;
        header?: string;
        footer?: string;
    }

    export interface IFill<TModel> {
        valProp?: string; //example:  'value', 'innerHTML', 'class'
        modelRootElement?: TModel;
        fill?: (el: HTMLElement, model: TModel) => string;
    }

    export interface IMergeCallOptions<T> {
        prefix?: string;
        call?: (el: HTMLElement, props: { [key: string]: any; }) => void;
        options?: T;
        callLabel?: string;
    }

    export interface ILazyLoadRule {
        lazyLoadCondition?: (el: HTMLElement) => boolean;
    }

    export interface IObjectMerge {
        mergedObject: { [key: string]: any; };
        merge<T>(prifix: string, obj: T);
    }

    export interface ruleOptions {
        rootNode?: NodeSelector;
        trigger?: ruleEvalTrigger;
    }
 
    //#endregion

    //#region Merging
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

    export function beginMerge<T>(callOpts: IMergeCallOptions<T>): ObjectMerge {
        var mergedObject: { [key: string]: any; } = {};
        var om = new ObjectMerge(mergedObject);
        om.merge(callOpts);
        return om;
    }
    //#endregion
    
    //#region Module Level Data

    var rules: ICascadingRule[] = [];
    var rulesIdx = 0;

    var uidIdx = 0;

    //#endregion

    //#region Main

    export function _if(selectorText: string, props: { [key: string]: any; }) : typeof tsp {
        rules[rulesIdx++] = {
            selectorText: selectorText,
            properties: props,
            docOrder: rulesIdx,
        };
        return tsp;
    }

    export function applyRules(options?: ruleOptions) {
        options = setRuleOptionDefaults(options);
        if ((options.trigger & ruleEvalTrigger.onPageLoad) == ruleEvalTrigger.onPageLoad) {
            if (isClientSideMode()) {
                if (tcp.pageisloaded) {
                    doRules(options);
                } else {
                    window.addEventListener('load', function () {
                        doRules(options);
                    });
                }
            } else {
                doRules(options);
            }
        }
        if (isClientSideMode()) {
            if ((options.trigger & ruleEvalTrigger.onAsyncScriptLoad) == ruleEvalTrigger.onAsyncScriptLoad) {
                var scripts = document.querySelectorAll('script[async]');
                for (var i = 0, n = scripts.length; i < n; i++) {
                    var scr = <HTMLScriptElement> scripts[i];
                    if (scr.readyState === 'complete') {
                        doRules(options);
                    } else {
                        scr.addEventListener('load', function () {
                            doRules(options);
                        });
                    }
                }
            }
        }
    }

    //#endregion

    //#region Grid Helpers
    export function MakeRCsUnique(content: string) {
        var spl = content.split('data-rc=\"r,');
        var count = 0;
        for (var i = 0, n = spl.length; i < n - 1; i++) {
            var aft = spl[i + 1];
            if (aft.substr(0, 2) == '1"') {
                count++;
            }
            spl[i + 1] = count + ',' + aft;
        }
        return spl.join('data-rc=\"');
    }

    //#endregion

    //#region Enums

    export enum ruleEvalTrigger {
        onPageLoad = 1,
        onAsyncScriptLoad = 2,
        onFormElementChange = 4
    }

    //#endregion

    //#region Rules Application

    function setRuleOptionDefaults(ruleOpts: ruleOptions) {
        if (!ruleOpts) ruleOpts = {};
        if (!ruleOpts.rootNode) ruleOpts.rootNode = document;
        if (!ruleOpts.trigger) ruleOpts.trigger = ruleEvalTrigger.onPageLoad;
        return ruleOpts;
    }

    

    function doRules(options: ruleOptions) {
        var doc = options.rootNode;
        var emmetSelector = 'script[type="text/emmet"][data-mode="';
        if (isClientSideMode()) {
            emmetSelector += 'client-side-only';
        } else {
            emmetSelector += 'server-side-only'
        }
        emmetSelector += '"]';
        var emmetNodes = doc.querySelectorAll(emmetSelector);
        for (var i = 0, n = emmetNodes.length; i < n; i++) {
            var nd = <HTMLElement> emmetNodes[i];
            var inner = $.trim(nd.innerHTML);
            var content = emmet.expandAbbreviation(inner, 'html', 'html', null).split('${0}').join('');
            var templ = nd.getAttribute('data-processor');
            if (templ) {
                var fn = eval(templ);
                content = fn(content);
            }
            nd.insertAdjacentHTML('beforebegin', content);
            var prevSibling = <HTMLElement> nd.previousSibling;
            nd.parentNode.removeChild(nd);

        }
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
                var exe_props: { [key: string]: any; } = data(nd).exe;// data(nd).exe;
                if (!exe_props) {
                    exe_props = {};
                    //data(nd).exe = exe_props;
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
            tcp.performReservedRules(doc);

        } else {
        }
        
        //#endregion
    }

    export function evalRulesSubset(props: { [key: string]: any; }, prefix: string): any {
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
    
    //#endregion

    function isClientSideMode() {
        return typeof (mode) == 'undefined' || mode !== 'server'
    }

    

    //#region TSP Rules

    export function action(el: HTMLElement, props: { [key: string]: any; }) {
        var actionRule = <IAction> evalRulesSubset(props, prefix);
        actionRule.action(el);
    }

    //#region Conditional
    export function conditionalRule(el: HTMLElement, props: { [key: string]: any; }) {
        var conditionalRule = <IConditionalRule> evalRulesSubset(props, prefix);
        if (!conditionalRule.condition) return;

        var test = conditionalRule.condition(el);
        if (test && conditionalRule.actionIfTrue) {
            conditionalRule.actionIfTrue(el);
        } else if (!test && conditionalRule.actionIfFalse) {
            conditionalRule.actionIfFalse(el);
        }
    }
    export function createConditionalRule(conditionalRuleOptions: IConditionalRule) {
        var conditionObj = tsp.beginMerge<tsp.IConditionalRule>({
            call: conditionalRule,
            prefix: prefix,
            options: conditionalRuleOptions,
        });
        return conditionObj;
    }
    //#endregion

    export function createFilterRule(filterRule: IFilterOptions) {
        return tsp.beginMerge({
            prefix: prefix,
            options: filterRule,
        });
    }

    //#region fill
    export function applyFillRule<TModel>(el: HTMLElement, props: { [key: string]: any; }) {
        var fillRule = <IFill<TModel>> evalRulesSubset(props, prefix);
        var model = fillRule.modelRootElement;
        var val = fillRule.fill(el, model);
        var valProp = fillRule.valProp;

        if (isClientSideMode()) {
            switch (valProp) {
                case 'innerHTML':
                    el.innerHTML = val;
                    break;
                case 'value':
                    el[valProp] = val;
                    break;
                default:
                    el.setAttribute(valProp, val);
            }
        } else {
            //can't get el[valProp] to work in HtmlNodeFacade
            el.setAttribute(valProp, val);
        }


    }
    export function createFillRule<TModel>(fillRule: IFill<TModel>) {
        return tsp.beginMerge<IFill<TModel>>({
            call: applyFillRule,
            prefix: prefix,
            options: fillRule,
        });
    }
    //#endregion

    export function lazyLoad(el: HTMLElement, props: { [key: string]: any; }, doc: HTMLDocument) {
        if (isClientSideMode()) return;
        var lazyRule = <ILazyLoadRule> evalRulesSubset(props, prefix);
        if (lazyRule.lazyLoadCondition) {
            if (!lazyRule.lazyLoadCondition(el)) return;
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

    export function setAttr(el: HTMLElement, props: { [key: string]: any; }) {
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
    //#endregion

    export function createInputAutoFillRule(model: any) {
        var modelRoot = <IHttpContext> model['httpContext'];
        var fillRule: IFill<IHttpContext> = {
            modelRootElement: modelRoot,
            valProp: 'value',
            fill: (el: HTMLElement , mdl : IHttpContext) => getValFromRequest(<HTMLInputElement> el, mdl.Request),
        };
        _if('input[type="text"],input[type="hidden"]', createFillRule<IHttpContext>(fillRule).mergedObject)
    }

    //#region data grid support

    export interface IDataTable {
        data?: any[][];
        fields?: IDataField[];

        rowView?: number[];
        rowDontView?: number[];
    }

    export interface IFilterOptions {
        matchWholeString?: boolean;
        caseSensitive?: boolean;
    }

    function checkFilterVal(val: string, filter: string, options?: IFilterOptions): boolean {
        if (options) {
            if (options.caseSensitive) {
                val = val.toLowerCase();
                filter = filter.toLowerCase();
            }
            if (options.matchWholeString) return val == filter;
        }
        return val.substr(0, filter.length) == filter;
    }

    

    export function filterColumn(dt: IDataTable, col: number, filter: string, options?: IFilterOptions) {
        var view = dt.rowView;
        var data = dt.data;
        var dontView = dt.rowDontView;
        if (!view) {
            view = [];
            dt.rowView = view;
            dontView = [];
            dt.rowDontView = dontView;
            for (var i = 0, n = dt.data.length; i < n; i++) {
                var val = data[i][col].toString(); //TODO:
                if (checkFilterVal(val, filter, options)) {
                    view.push(i);
                } else {
                    dontView.push(i);
                }
            }
        } else {
            var newView : number[] = [];
            for (var i = 0, n = view.length; i < n; i++) {
                var rowIdx = view[i];
                var val = data[rowIdx][col].toString(); //TODO:
                if (!checkFilterVal(val, filter, options)) {
                    dontView.push(i);
                } else {
                    newView.push(i);
                }
            }
            dt.rowView = newView;
        }
        
    }

    export function getOrCreateHiddenInput(el: HTMLElement, inputName: string, callBack: (hiddenFld: HTMLInputElement) => void) {
        var frmAtts = el.getAttribute('form');
        if (!frmAtts) {
            frmAtts = el.id + '_form';
            el.setAttribute('form', frmAtts);
        }
        var frms = frmAtts.split(' ');
        var body = document.body;
        for (var i = 0, n = frms.length; i < n; i++) {
            var frmID = frms[i];
            var frm = document.getElementById(frmID);
            if (!frm) {
                frm = document.createElement("form");
                frm.id = frmID;
                body.appendChild(frm)
            }
            //var $inpFld = $frm.find('.' + inputName);
            var inpFlds = frm.querySelectorAll('.' + inputName);
            var inpFld;
            if (inpFlds.length == 0) {
                inpFld = document.createElement('input');
                var $inpFld = $(inpFld);
                $inpFld.attr('type', 'hidden').attr('name', inputName.replace('_value', '')).addClass(inputName);
                frm.appendChild(inpFld);
                callBack(inpFld);
            } else {
                for (var j = 0, n1 = inpFlds.length; j < n1; j++) {
                    var inpFld2 = <HTMLInputElement> inpFlds[j];
                    callBack(inpFld2);
                }
            }
            
            
        }
    }

    export function applyAllFilters(templEl: HTMLElement, populateRule : IPopulateRectCoordinates) {
        var filters = document.querySelectorAll('input[type="hidden"].' + templEl.id + '_filter');
        var dt = populateRule.getDataTable(templEl);
        dt.rowView = null;
        for (var i = 0, n = filters.length; i < n; i++) {
            var filter = <HTMLInputElement> filters[i];
            var filterVal = filter.value;
            if (filterVal.length == 0) continue;
            var elIDTokens = filter.name.split('_');
            filterColumn(dt, parseInt(elIDTokens[3]) - 1, filterVal);
        }
    }

    export function getNodeFldIdx(dt: IDataTable): number {
        var treeFldIdx = -1;
        var flds = dt.fields;
        for (var i = 0, n = flds.length; i < n; i++) {
            var fld = flds[i];
            if (fld.isTreeNodeInfo) {
                treeFldIdx = i;
                break;
            }
        }
        return treeFldIdx;
    }

    export enum nodeIdxes {
        text = 0,
        id = 1,
        parentId = 2,
        level = 3,
        numChildren = 4,
    }

    export function applyTreeView(templEl: HTMLElement, populateRule: IPopulateRectCoordinates) {
        var dt = populateRule.getDataTable(templEl);
        var expanded = {};
        var treeFldIdx = getNodeFldIdx(dt);
        if (treeFldIdx == -1) {
            populateRule.treeColumn = TreeType.none;
            return;
        }
        data(templEl).treeNodeIndex = treeFldIdx;
        var d = dt.data;
        var view = [];
        var dontView = [];
        for (var i = 0, n = d.length; i < n; i++) {
            var r = d[i];
            var tn = r[treeFldIdx];

            if (tn[nodeIdxes.numChildren] < 0) {
                expanded[tn[nodeIdxes.id]] = true;
            }
            var parentID = tn[nodeIdxes.parentId];
            if(!parentID || expanded[parentID]){
                view.push(i);
            } else {
                dontView.push(i);
            }
        }
        dt.rowView = view;
        dt.rowDontView = dontView;
        var vSlider = tsp.data(templEl).slider;
        if (vSlider) vSlider.slider('option', 'max', view.length);
    }

    

    export enum SelectionOptions {
        none,
        single,
        multiple,
    }

    export enum TitleFillOptions {
        none,
        text,
    }

    export enum TreeType {
        none,
        simple,
    }

    export interface IPopulateRectCoordinates {
        //templateSelector: string;
        //verticalOffsetCtlSelector?: 
        getDataTable?: (el: HTMLElement) => IDataTable;
        suppressVerticalVirtualization?: boolean;
        //supportRowSelection?: boolean;
        rowSelection?: SelectionOptions;
        treeColumn?: TreeType;
        //supportToolTips?: boolean;
        titleFill?: TitleFillOptions;
    }

    export function TreeGridColumnRenderer(node: any[]) : string {
        var sR;
        //var nd4 = node[4];
        var nd4 = node[nodeIdxes.numChildren];
        var sp = '<span style="display:inline-block;width:' + (node[nodeIdxes.level] * 10) + 'px">&nbsp;</span>';
        if (nd4 > 0) {
            //sR = '<span class="dynatree-expander treeNodeToggler">&nbsp;</span>';
            sR = '<span class="ui-state-default ui-icon plus treeNodeToggler">&nbsp;</span>';
        } else if (nd4 == 0) {
            sR = '';
        } else {
            sR = '<span class="ui-state-default ui-icon minus treeNodeToggler">&nbsp;</span>';
        }
        return sp + sR + node[nodeIdxes.text];
    }

    export function refreshTemplateWithRectCoords(el: HTMLElement, rowOffsetFld?: HTMLInputElement, populateRule?: IPopulateRectCoordinates) {
        var rowOffsetFld2;
        if(rowOffsetFld){
            rowOffsetFld2 = rowOffsetFld;
        }else{
            rowOffsetFld2 = document.querySelectorAll('.' + el.id + '_rowOffset')[0];
        }
        //var rowOffsetFld2 = rowOffsetFld ? rowOffsetFld : <HTMLInputElement> document.getElementById(el.id + '_rowOffset');
        var rowOffset = (rowOffsetFld2 && rowOffsetFld2.value.length > 0) ? parseInt(rowOffsetFld2.value) : 0;
        var rcs = el.querySelectorAll('*[data-rc]');
        var rule = populateRule ? populateRule : <IPopulateRectCoordinates> tsp.data(el).populateRule;
        var dataTable = rule.getDataTable(el);
        var dt = dataTable.data;
        var view = dataTable.rowView;
        var tnIdx = -1;
        switch (rule.treeColumn) {
            case TreeType.simple:
                tnIdx = <number> data(el).treeNodeIndex;
                break;
        }
        for (var i = 0, n = rcs.length; i < n; i++) {
            var rc = <HTMLElement> rcs[i];
            var coord = rc.getAttribute('data-rc').split(',');
            var row = parseInt(coord[0]) - 1 + rowOffset;
            var col = parseInt(coord[1]) - 1;
            var dRow;
            if (view) {
                row = (row < view.length) ? view[row] : -1

            } 
            if (row < 0) {
                dRow = null;
            } else {
                dRow = row < dt.length ? dt[row] : null;

            }
            var val;
            if (dRow == null) {
                val = '&nbsp;';
            } else if (tnIdx == col) {
                val = TreeGridColumnRenderer(dRow[col]);
            } else {
                var val = dRow[col];
            }
            rc.innerHTML = val;
        }
    }

    export function fillGrid(el: HTMLElement, props: { [key: string]: any; }) {
        if (tsp.data(el).initialized) return;
        var populateRule = <IPopulateRectCoordinates> evalRulesSubset(props, prefix);
        getOrCreateHiddenInput(el, el.id + '_rowOffset', hiddenFld => {
            tsp.data(el).populateRule = populateRule;
            if (!el.getAttribute('data-populated')) {
                switch (populateRule.treeColumn) {
                    case TreeType.simple:
                        applyTreeView(el, populateRule);
                        break;
                }
                refreshTemplateWithRectCoords(el, hiddenFld, populateRule);
                el.setAttribute('data-populated', 'yes');
            }
            if (isClientSideMode()) {
                switch(populateRule.rowSelection){
                    case SelectionOptions.single:
                        tcp.addRowSelection(el);
                        break;
                }
                switch (populateRule.treeColumn) {
                    case TreeType.simple:
                        applyTreeView(el, populateRule);
                        tcp.addTreeNodeToggle(el);
                }
                if (!populateRule.suppressVerticalVirtualization) {
                    tcp.addVScroller(el, populateRule.getDataTable(el), hiddenFld);
                }
                switch(populateRule.titleFill){
                    case TitleFillOptions.text:
                        tcp._when('mousemove', {
                            selectorNodeTest: 'td',
                            handler: function (evt) {
                                var el = evt.srcElement;
                                el.title = el.innerText;
                            }
                        });
                        break;
                }
            } 
        });
        tsp.data(el).initialized = true;
        
            
    }

    //#endregion   

    function getValFromRequest(ie: HTMLInputElement, req: IHttpRequest): string {
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