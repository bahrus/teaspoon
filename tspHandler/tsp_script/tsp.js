///<reference path='jQueryFacade.d.ts'/>
///<reference path='tcp.ts'/>
///<reference path='emmet.d.ts'/>

// Type definitions for the DOM Mutation Observers API
// http://dom.spec.whatwg.org/#mutation-observers
var tsp;
(function (tsp) {
    tsp.prefix = 'tsp-';

    //#region jquery facade
    tsp.$;

    tsp.reserved_lazyLoad = 'reserved_lazyLoad';

    if (!isClientSideMode()) {
        tsp.$ = jQueryServerSideFacade.jQuery;
        tsp.$.trim = function (s) {
            return tsp.$().trim(s);
        };
    } else {
        tsp.$ = eval('jQuery');
    }

    var cache = [{}];
    tsp.dataExpando = isClientSideMode() ? 'data-tcp-cache' : 'data-tsp-cache';

    function data(elem) {
        var $el = tsp.$(elem);
        var cacheIndex = elem.getAttribute(tsp.dataExpando), nextCacheIndex = cache.length;

        //var cacheIndex = $el.attr(expando), nextCacheIndex = cache.length;
        var nCacheIndex;
        if (!cacheIndex) {
            $el.attr(tsp.dataExpando, nextCacheIndex.toString());

            //elem.setAttribute(expando, nextCacheIndex.toString());
            cache[nextCacheIndex] = {};
            nCacheIndex = nextCacheIndex;
        } else {
            nCacheIndex = parseInt(cacheIndex);
        }
        if (!cache[nCacheIndex])
            cache[nextCacheIndex] = {};
        return cache[nCacheIndex];
    }
    tsp.data = data;

    

    //#endregion
    //#region Merging
    var ObjectMerge = (function () {
        function ObjectMerge(mergedObject) {
            this.mergedObject = mergedObject;
        }
        ObjectMerge.prototype.merge = function (callOpts) {
            var prefix = callOpts.prefix ? callOpts.prefix : '';
            var obj = callOpts.options;
            if (obj) {
                for (var prop in callOpts.options) {
                    var sProp = prop;
                    this.mergedObject[prefix + sProp] = obj[prop];
                }
            }
            var sCall = callOpts.callLabel ? callOpts.callLabel : 'call';
            if (callOpts.call)
                this.mergedObject[sCall] = callOpts.call;
        };
        return ObjectMerge;
    })();
    tsp.ObjectMerge = ObjectMerge;

    function beginMerge(callOpts) {
        var mergedObject = {};
        var om = new ObjectMerge(mergedObject);
        om.merge(callOpts);
        return om;
    }
    tsp.beginMerge = beginMerge;

    //#endregion
    //#region Module Level Data
    var rules = [];
    var rulesIdx = 0;

    var uidIdx = 0;

    //#endregion
    //#region Main
    function _if(selectorText, props) {
        rules[rulesIdx++] = {
            selectorText: selectorText,
            properties: props,
            docOrder: rulesIdx
        };
        return tsp;
    }
    tsp._if = _if;

    function applyRules(options) {
        options = setRuleOptionDefaults(options);
        if ((options.trigger & 1 /* onPageLoad */) == 1 /* onPageLoad */) {
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
            if ((options.trigger & 2 /* onAsyncScriptLoad */) == 2 /* onAsyncScriptLoad */) {
                var scripts = document.querySelectorAll('script[async]');
                for (var i = 0, n = scripts.length; i < n; i++) {
                    var scr = scripts[i];
                    if (scr.readyState === 'complete') {
                        doRules(options);
                    } else {
                        scr.addEventListener('load', function () {
                            doRules(options);
                        });
                    }
                }
            }
            if (options.trigger & 8 /* onClientSideFormSubmit */) {
                tcp.reapplyRulesOnFormSubmit = true;
            }
        }
    }
    tsp.applyRules = applyRules;

    //#endregion
    //#region Grid Helpers
    function MakeRCsUnique(content) {
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
    tsp.MakeRCsUnique = MakeRCsUnique;

    //#endregion
    //#region Enums
    (function (ruleEvalTrigger) {
        ruleEvalTrigger[ruleEvalTrigger["onPageLoad"] = 1] = "onPageLoad";
        ruleEvalTrigger[ruleEvalTrigger["onAsyncScriptLoad"] = 2] = "onAsyncScriptLoad";
        ruleEvalTrigger[ruleEvalTrigger["onFormElementChange"] = 4] = "onFormElementChange";
        ruleEvalTrigger[ruleEvalTrigger["onClientSideFormSubmit"] = 8] = "onClientSideFormSubmit";
    })(tsp.ruleEvalTrigger || (tsp.ruleEvalTrigger = {}));
    var ruleEvalTrigger = tsp.ruleEvalTrigger;

    //#endregion
    //#region Rules Application
    function setRuleOptionDefaults(ruleOpts) {
        if (!ruleOpts)
            ruleOpts = {};
        if (!ruleOpts.rootNode)
            ruleOpts.rootNode = document;
        if (!ruleOpts.trigger)
            ruleOpts.trigger = 1 /* onPageLoad */;
        return ruleOpts;
    }

    function doRules(options) {
        var doc = options.rootNode;
        var emmetSelector = 'script[type="text/emmet"][data-mode="';
        if (isClientSideMode()) {
            emmetSelector += 'client-side-only';
        } else {
            emmetSelector += 'server-side-only';
        }
        emmetSelector += '"]';
        var emmetNodes = doc.querySelectorAll(emmetSelector);
        for (var i = 0, n = emmetNodes.length; i < n; i++) {
            var nd = emmetNodes[i];
            var inner = tsp.$.trim(nd.innerHTML);
            var content = emmet.expandAbbreviation(inner, 'html', 'html', null).split('${0}').join('');
            var templ = nd.getAttribute('data-processor');
            if (templ) {
                var fn = eval(templ);
                content = fn(content);
            }
            nd.insertAdjacentHTML('beforebegin', content);
            var prevSibling = nd.previousSibling;
            nd.parentNode.removeChild(nd);
        }
        var affectedEls = {};

        for (var i = 0; i < rulesIdx; i++) {
            //#region iterate over all the rules
            var rule = rules[i];
            var nds = doc.querySelectorAll(rule.selectorText);
            for (var j = 0, n = nds.length; j < n; j++) {
                //#region iterate over all the matching elements
                var nd = nds[j];
                if (!nd.id) {
                    nd.id = 'tsp_' + uidIdx++;
                }
                affectedEls[nd.id] = nd;
                var tsp_props = data(nd).tsp;
                if (!tsp_props) {
                    tsp_props = {};
                    data(nd).tsp = tsp_props;
                }
                var exe_props = data(nd).exe;
                if (!exe_props) {
                    exe_props = {};

                    //data(nd).exe = exe_props;
                    data(nd).exe = exe_props;
                }
                var props = rule.properties;
                for (var key in props) {
                    if (props.hasOwnProperty(key)) {
                        var sKey = key;
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

        for (var key in affectedEls) {
            if (affectedEls.hasOwnProperty(key)) {
                var nd = affectedEls[key];
                var exes = data(nd).exe;
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

    function evalRulesSubset(props, prefix) {
        var returnObj = {};
        for (var key in props) {
            if (props.hasOwnProperty(key)) {
                var sKey = key;
                if (sKey.substr(0, prefix.length) !== prefix)
                    continue;
                sKey = sKey.substr(prefix.length);
                var sKeyLHS = sKey.replace('-', '_');
                returnObj[sKeyLHS] = props[key];
            }
        }
        return returnObj;
    }
    tsp.evalRulesSubset = evalRulesSubset;

    //#endregion
    function isClientSideMode() {
        return typeof (mode) == 'undefined' || mode !== 'server';
    }

    //#region TSP Rules
    function action(el, props) {
        var actionRule = evalRulesSubset(props, tsp.prefix);
        actionRule.action(el);
    }
    tsp.action = action;

    //#region Conditional
    function conditionalRule(el, props) {
        var conditionalRule = evalRulesSubset(props, tsp.prefix);
        if (!conditionalRule.condition)
            return;

        var test = conditionalRule.condition(el);
        if (test && conditionalRule.actionIfTrue) {
            conditionalRule.actionIfTrue(el);
        } else if (!test && conditionalRule.actionIfFalse) {
            conditionalRule.actionIfFalse(el);
        }
    }
    tsp.conditionalRule = conditionalRule;
    function createConditionalRule(conditionalRuleOptions) {
        var conditionObj = tsp.beginMerge({
            call: conditionalRule,
            prefix: tsp.prefix,
            options: conditionalRuleOptions
        });
        return conditionObj;
    }
    tsp.createConditionalRule = createConditionalRule;

    //#endregion
    function createFilterRule(filterRule) {
        return tsp.beginMerge({
            prefix: tsp.prefix,
            options: filterRule
        });
    }
    tsp.createFilterRule = createFilterRule;

    //#region fill
    function applyFillRule(el, props) {
        var fillRule = evalRulesSubset(props, tsp.prefix);
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
    tsp.applyFillRule = applyFillRule;
    function createFillRule(fillRule) {
        return tsp.beginMerge({
            call: applyFillRule,
            prefix: tsp.prefix,
            options: fillRule
        });
    }
    tsp.createFillRule = createFillRule;

    //#endregion
    function lazyLoad(el, props, doc) {
        if (isClientSideMode())
            return;
        var lazyRule = evalRulesSubset(props, tsp.prefix);
        if (lazyRule.lazyLoadCondition) {
            if (!lazyRule.lazyLoadCondition(el))
                return;
        }
        var ndHidden = doc.createElement('script');
        var sOriginalID = el.id;
        el.setAttribute('data-originalID', sOriginalID);
        el.id = el.id + '_temp';
        ndHidden.setAttribute('type', 'text/html');
        ndHidden.className = tsp.reserved_lazyLoad;
        var inserted = el.parentNode.insertBefore(ndHidden, el);
        inserted.appendChild(el);

        //inserted.setAttribute('id', sOriginalID);
        inserted.id = sOriginalID;
    }
    tsp.lazyLoad = lazyLoad;

    function setAttr(el, props) {
        var attrRule = evalRulesSubset(props, tsp.prefix);
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
    tsp.setAttr = setAttr;

    //#endregion
    function createInputAutoFillRule(model) {
        var modelRoot = model['httpContext'];
        var fillRule = {
            modelRootElement: modelRoot,
            valProp: 'value',
            fill: function (el, mdl) {
                return getValFromRequest(el, mdl.Request);
            }
        };
        _if('input[type="text"],input[type="hidden"]', createFillRule(fillRule).mergedObject);
    }
    tsp.createInputAutoFillRule = createInputAutoFillRule;

    

    function checkFilterVal(val, filter, options) {
        if (options) {
            if (options.caseSensitive) {
                val = val.toLowerCase();
                filter = filter.toLowerCase();
            }
            if (options.matchWholeString)
                return val == filter;
        }
        return val.substr(0, filter.length) == filter;
    }

    function filterColumn(dt, col, filter, options) {
        var view = dt.rowView;
        var data = dt.data;
        var dontView = dt.rowDontView;
        if (!view) {
            view = [];
            dt.rowView = view;
            dontView = [];
            dt.rowDontView = dontView;
            for (var i = 0, n = dt.data.length; i < n; i++) {
                var val = data[i][col].toString();
                if (checkFilterVal(val, filter, options)) {
                    view.push(i);
                } else {
                    dontView.push(i);
                }
            }
        } else {
            var newView = [];
            for (var i = 0, n = view.length; i < n; i++) {
                var rowIdx = view[i];
                var val = data[rowIdx][col].toString();
                if (!checkFilterVal(val, filter, options)) {
                    dontView.push(i);
                } else {
                    newView.push(i);
                }
            }
            dt.rowView = newView;
        }
    }
    tsp.filterColumn = filterColumn;

    function getOrCreateHiddenInput(el, inputName, callBack) {
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
                body.appendChild(frm);
            }

            //var $inpFld = $frm.find('.' + inputName);
            var inpFlds = frm.querySelectorAll('.' + inputName);
            var inpFld;
            if (inpFlds.length == 0) {
                inpFld = document.createElement('input');
                var $inpFld = tsp.$(inpFld);
                $inpFld.attr('type', 'hidden').attr('name', inputName.replace('_value', '')).addClass(inputName);
                frm.appendChild(inpFld);
                callBack(inpFld);
            } else {
                for (var j = 0, n1 = inpFlds.length; j < n1; j++) {
                    var inpFld2 = inpFlds[j];
                    callBack(inpFld2);
                }
            }
        }
    }
    tsp.getOrCreateHiddenInput = getOrCreateHiddenInput;

    function applyAllFilters(templEl, populateRule) {
        var filters = document.querySelectorAll('input[type="hidden"].' + templEl.id + '_filter');
        var dt = populateRule.getDataTable(templEl);
        dt.rowView = null;
        for (var i = 0, n = filters.length; i < n; i++) {
            var filter = filters[i];
            var filterVal = filter.value;
            if (filterVal.length == 0)
                continue;
            var elIDTokens = filter.name.split('_');
            filterColumn(dt, parseInt(elIDTokens[3]) - 1, filterVal);
        }
    }
    tsp.applyAllFilters = applyAllFilters;

    function getNodeFldIdx(dt) {
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
    tsp.getNodeFldIdx = getNodeFldIdx;

    (function (nodeIdxes) {
        nodeIdxes[nodeIdxes["text"] = 0] = "text";
        nodeIdxes[nodeIdxes["id"] = 1] = "id";
        nodeIdxes[nodeIdxes["parentId"] = 2] = "parentId";
        nodeIdxes[nodeIdxes["level"] = 3] = "level";
        nodeIdxes[nodeIdxes["numChildren"] = 4] = "numChildren";
    })(tsp.nodeIdxes || (tsp.nodeIdxes = {}));
    var nodeIdxes = tsp.nodeIdxes;

    function applyTreeView(templEl, populateRule) {
        var dt = populateRule.getDataTable(templEl);
        var expanded = {};
        var treeFldIdx = getNodeFldIdx(dt);
        if (treeFldIdx == -1) {
            populateRule.treeColumn = 0 /* none */;
            return;
        }
        data(templEl).treeNodeIndex = treeFldIdx;
        var d = dt.data;
        var view = [];
        var dontView = [];
        for (var i = 0, n = d.length; i < n; i++) {
            var r = d[i];
            var tn = r[treeFldIdx];

            if (tn[4 /* numChildren */] < 0) {
                expanded[tn[1 /* id */]] = true;
            }
            var parentID = tn[2 /* parentId */];
            if (!parentID || expanded[parentID]) {
                view.push(i);
            } else {
                dontView.push(i);
            }
        }
        dt.rowView = view;
        dt.rowDontView = dontView;
        var vSlider = tsp.data(templEl).slider;
        if (vSlider)
            vSlider.slider('option', 'max', view.length);
    }
    tsp.applyTreeView = applyTreeView;

    (function (SelectionOptions) {
        SelectionOptions[SelectionOptions["none"] = 0] = "none";
        SelectionOptions[SelectionOptions["single"] = 1] = "single";
        SelectionOptions[SelectionOptions["multiple"] = 2] = "multiple";
    })(tsp.SelectionOptions || (tsp.SelectionOptions = {}));
    var SelectionOptions = tsp.SelectionOptions;

    (function (TitleFillOptions) {
        TitleFillOptions[TitleFillOptions["none"] = 0] = "none";
        TitleFillOptions[TitleFillOptions["text"] = 1] = "text";
    })(tsp.TitleFillOptions || (tsp.TitleFillOptions = {}));
    var TitleFillOptions = tsp.TitleFillOptions;

    (function (TreeType) {
        TreeType[TreeType["none"] = 0] = "none";
        TreeType[TreeType["simple"] = 1] = "simple";
    })(tsp.TreeType || (tsp.TreeType = {}));
    var TreeType = tsp.TreeType;

    function TreeGridColumnRenderer(node) {
        var sR;

        //var nd4 = node[4];
        var nd4 = node[4 /* numChildren */];
        var sp = '<span style="display:inline-block;width:' + (node[3 /* level */] * 10) + 'px">&nbsp;</span>';
        if (nd4 > 0) {
            //sR = '<span class="dynatree-expander treeNodeToggler">&nbsp;</span>';
            sR = '<span class="ui-state-default ui-icon plus treeNodeToggler">&nbsp;</span>';
        } else if (nd4 == 0) {
            sR = '';
        } else {
            sR = '<span class="ui-state-default ui-icon minus treeNodeToggler">&nbsp;</span>';
        }
        return sp + sR + node[0 /* text */];
    }
    tsp.TreeGridColumnRenderer = TreeGridColumnRenderer;

    function refreshTemplateWithRectCoords(el, rowOffsetFld, populateRule) {
        var rowOffsetFld2;
        if (rowOffsetFld) {
            rowOffsetFld2 = rowOffsetFld;
        } else {
            rowOffsetFld2 = document.querySelectorAll('.' + el.id + '_rowOffset')[0];
        }

        //var rowOffsetFld2 = rowOffsetFld ? rowOffsetFld : <HTMLInputElement> document.getElementById(el.id + '_rowOffset');
        var rowOffset = (rowOffsetFld2 && rowOffsetFld2.value.length > 0) ? parseInt(rowOffsetFld2.value) : 0;
        var rcs = el.querySelectorAll('*[data-rc]');
        var rule = populateRule ? populateRule : tsp.data(el).populateRule;
        var dataTable = rule.getDataTable(el);
        var dt = dataTable.data;
        var view = dataTable.rowView;
        var tnIdx = -1;
        switch (rule.treeColumn) {
            case 1 /* simple */:
                tnIdx = data(el).treeNodeIndex;
                break;
        }
        for (var i = 0, n = rcs.length; i < n; i++) {
            var rc = rcs[i];
            var coord = rc.getAttribute('data-rc').split(',');
            var row = parseInt(coord[0]) - 1 + rowOffset;
            var col = parseInt(coord[1]) - 1;
            var dRow;
            if (view) {
                row = (row < view.length) ? view[row] : -1;
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
    tsp.refreshTemplateWithRectCoords = refreshTemplateWithRectCoords;

    function fillGrid(el, props) {
        if (tsp.data(el).initialized) {
            if (tsp.data(el).repopulate) {
                tsp.data(el).repopulate = false;
                refreshTemplateWithRectCoords(el);
            }
            return;
        }
        var populateRule = evalRulesSubset(props, tsp.prefix);
        getOrCreateHiddenInput(el, el.id + '_rowOffset', function (hiddenFld) {
            tsp.data(el).populateRule = populateRule;
            if (!el.getAttribute('data-populated')) {
                switch (populateRule.treeColumn) {
                    case 1 /* simple */:
                        applyTreeView(el, populateRule);
                        break;
                }
                refreshTemplateWithRectCoords(el, hiddenFld, populateRule);
                el.setAttribute('data-populated', 'yes');
            }
            if (isClientSideMode()) {
                switch (populateRule.rowSelection) {
                    case 1 /* single */:
                        tcp.addRowSelection(el);
                        break;
                }
                switch (populateRule.treeColumn) {
                    case 1 /* simple */:
                        applyTreeView(el, populateRule);
                        tcp.addTreeNodeToggle(el);
                }
                if (!populateRule.suppressVerticalVirtualization) {
                    tcp.addVScroller(el, populateRule.getDataTable(el), hiddenFld);
                }
                switch (populateRule.titleFill) {
                    case 1 /* text */:
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
    tsp.fillGrid = fillGrid;

    //#endregion
    function getValFromRequest(ie, req) {
        return req.Params[ie.name];
    }
})(tsp || (tsp = {}));

var tsp;
(function (tsp) {
    (function (util) {
        function parse_selector(selector) {
            var simple_selectors = [];

            // Split by the group operator ','
            var commaDelimitedSelectors = selector.split(',');

            // Split each selector group by combinators ' ', '+', '~', '>'
            // :not() is a special case, do not include it as a pseudo-class
            // For the selector div > p:not(.foo) ~ span.bar,
            // sample output is ['div', 'p', '.foo', 'span', '.bar']
            return simple_selectors;
        }
    })(tsp.util || (tsp.util = {}));
    var util = tsp.util;
})(tsp || (tsp = {}));
//# sourceMappingURL=tsp.js.map
