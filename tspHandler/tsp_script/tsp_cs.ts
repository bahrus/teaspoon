///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='../Scripts/typings/underscore/underscore.d.ts'/>
///<reference path='tsp_b.ts'/>
///<reference path='DBS_cs.ts'/>



module tsp.cs {

    var db = DBS.b;
    var b = tsp.b;


    //#region Interfaces
    
    //#endregion

    //#region Event Handlers
    function handleCascadingEvent(evt: Event) {
        var el = <HTMLElement> evt.srcElement;
        //console.log(evt.type);
        var evtEl = el;
        while (el) {
            var bCheckedBody = (el.tagName == 'BODY');
            var test = el.getAttribute(db.dataExpando);
            if (test) {
                var evtHandlers = db.data(el).handlers;
                if (evtHandlers) {
                    var evtHandler = evtHandlers[evt.type];
                    if (evtHandler) {
                        for (var i = 0, n = evtHandler.length; i < n; i++) {
                            var cascadeHandler = <b.ICascadingHandler> evtHandler[i];
                            if (cascadeHandler.selectorNodeVoidTest) {
                                var containerEl : HTMLElement;
                                if (cascadeHandler.containerID) {
                                    containerEl = <HTMLElement> document.querySelector(cascadeHandler.containerID);
                                } else {
                                    containerEl = document.body;
                                }
                                var testContainer = containerEl.querySelector(cascadeHandler.selectorNodeVoidTest);
                                if (testContainer) {
                                    var testChild = el;
                                    var bIsContainer = false;
                                    while (testChild && testChild.tagName != 'BODY') {
                                        if (testChild === testContainer) {
                                            bIsContainer = true;
                                            break;
                                        }
                                        testChild = <HTMLElement> testChild.parentNode;
                                    }
                                    if (bIsContainer) continue;
                                    cascadeHandler.handler(evt, cascadeHandler);
                                }
                                continue;
                            }
                            var doesMatch = false;
                            if (cascadeHandler.selectorNodeTest) {
                                //var matchor = el['mozMatchesSelector'] || el['webkitMatchesSelector'] || el.msMatchesSelector;
                                if (evtEl.msMatchesSelector) {
                                    doesMatch = evtEl.msMatchesSelector(cascadeHandler.selectorNodeTest);
                                    //console.log(evtEl.tagName + '?' + cascadeHandler.selectorNodeTest + ' doesMatch = ' + doesMatch);
                                } else {//need to test other browsers with native support
                                    doesMatch = matchesSelector(evtEl, cascadeHandler.selectorNodeTest);
                                }
                            }
                            if (doesMatch) {
                                cascadeHandler.handler(evt, cascadeHandler);
                                return;  //TODO:  really?  return?
                            }
                        }
                    }
                }
            }
            el = <HTMLElement> el.parentNode;
            if (bCheckedBody) return;
        }


    }

    function handleCloseOnClickOut(evt: Event, cascadeHandler: b.ICascadingHandler) {
        $(cascadeHandler.selectorNodeVoidTest).hide();
    }

    function handleScroll(evt: Event) {

        //console.log(evt);

        var src = <HTMLDivElement> evt.srcElement;
        var scrollOptions = <tsp.b.IScrollOptions> DBS.b.data(src)['scrollOptions'];
        var newVal;
        switch (scrollOptions.direction) {
            case b.DirectionOptions.Horizontal:
                newVal = Math.floor(src.scrollLeft / scrollOptions.maxElementSize);
                break;
            case b.DirectionOptions.Vertical:
                newVal = Math.floor(src.scrollTop / scrollOptions.maxElementSize);
                break;
        }

        if (newVal !== scrollOptions.currentValue) {
            console.log(newVal);
            scrollOptions.currentValue = newVal;
            var ft = scrollOptions.formTargets;
            var fields = getOrCreateFormElements$(ft, src.id + '_ScrollVal');
            for (var i = 0, n = fields.length; i < n; i++) {
                var fld = fields[i];
                fld.value = newVal.toString();
            }
        }
    }

    function handleTreeNodeToggle(evt: Event, cascadeInfo: b.ICascadingHandler) {
        var evtEl = evt.srcElement;
        var $evtEl = $(evtEl);
        $evtEl.toggleClass('fa-plus-square-o').toggleClass('fa-minus-square-o');
        var dataCell = evtEl;

        var rc = dataCell.getAttribute('data-rc');
        while (dataCell && !rc) {
            dataCell = <Element> dataCell.parentNode;
            rc = dataCell.getAttribute('data-rc');
        }
        if (!dataCell) return;
        var rowNo = parseInt(rc.split(',')[0]) - 1;
        var templEl = document.getElementById(cascadeInfo.containerID);
        var rule = <tsp.b.IFillGridOptions> db.extractDirective(templEl, 'fillGridOptions');
        //var rule = <tsp.b.IFillGridOptions> db.data(templEl).populateRule;
        var dt = rule.dataTableFn(templEl);
        //var dtRow = dt.data[rowNo];
        var dtRow = dt.data[dt.rowView[rowNo]];
        var ndFldIdx = b.getNodeFldIdx(dt);
        var nd = dtRow[ndFldIdx];
        var numChildren = nd[b.nodeIdxes.numChildren];
        nd[b.nodeIdxes.numChildren] = -1 * numChildren;
        b.applyTreeView(templEl, rule);
        b.refreshBodyTemplateWithRectCoords(templEl, null, rule);
        if (dt.changeNotifier) dt.changeNotifier.notifyListeners(dt);
    }

    function handleDisplayOnHover(evt: Event, cascadeInfo: b.ICascadingHandler) {
        var evtEl = evt.srcElement;
        var doho = <b.IDisplayOnHoverOptions> cascadeInfo.data;
        $('#' + doho.targetID).show();
    }

    export function handleToggleLockColumn(evt: Event, cascadeInfo: b.ICascadingHandler) {
        var gh = new gridHelper(evt, cascadeInfo);
        var dt = gh.getDataTable();

        
    }

    class gridHelper {
        _evt: Event;
        _templEl: HTMLElement;
        _ci: b.ICascadingHandler;
        _evtEl: HTMLElement;
        _fgo: b.IFillGridOptions;
        constructor(evt: Event, cascadeInfo: b.ICascadingHandler) {
            this._evt = evt;
            this._ci = cascadeInfo;
            this._evtEl = <HTMLElement> this._evt.srcElement;
            this._templEl = <HTMLElement> document.getElementById(this._ci.containerID);
            this._fgo = <b.IFillGridOptions> db.extractDirective(this._templEl, 'fillGridOptions');
        }
        //getFillGridOptions() : b.IFillGridOptions {
        //    return this._fgo;
        //}
        refreshHeaderAndBody() {
            b.refreshHeaderTemplateWithRectCoords(this._templEl, this._fgo);
            b.refreshBodyTemplateWithRectCoords(this._templEl, this._fgo.verticalOffsetFld, this._fgo);
        }
        getDataTable() : b.IDataTable {
            return this._fgo.dataTableFn(this._templEl);
        }
        getColNo() : number {
            var actionCell = this._evtEl;
            var ac = actionCell.getAttribute('data-ac');
            while (actionCell && !ac) {
                actionCell = <HTMLElement> actionCell.parentNode;
                ac = actionCell.getAttribute('data-ac');
            }
            var colNo = parseInt(ac.split(',')[1]) - 1;
            return colNo;
        }
        getColFieldNo(colNo: number, dt: b.IDataTable): number {
            var co = this.getColOffset();
            var virtualColNo = colNo + co;
            if (dt.colView) {
                return dt.colView[virtualColNo];
            }
            return virtualColNo;
        }
        getColOffset() {
            var fgo = this._fgo;
            return  (fgo && fgo.horizontalOffsetFld && fgo.horizontalOffsetFld.value.length > 0) ? parseInt(fgo.horizontalOffsetFld.value) : 0;
        }
        hideColumn(colFieldNo: number, dt: b.IDataTable) {
            if (!dt.colView) {
                var colView: number[] = [];
                for (var i = 0, n = dt.fields.length; i < n; i++) {
                    colView.push(i);
                }
                dt.colView = colView;
            } 
                
            dt.colView.splice(colFieldNo, 1);
            this.refreshHeaderAndBody();
            if (dt.changeNotifier) dt.changeNotifier.notifyListeners(dt);
        }
    }

    export function handleToggleColumn(evt: Event, cascadeInfo: b.ICascadingHandler) {
        var subCI = <b.ICascadingHandler> cascadeInfo.data.cascadeInfo;
        var colFieldNo = <number> cascadeInfo.data.colFieldNo;
        var gh = new gridHelper(evt, subCI);
        var dt = gh.getDataTable();
        dt.colView.push(colFieldNo);
        var cv = dt.colView;
        var closestIndex = 0;
        for (var i = 0, n = cv.length; i < n; i++) {
            var cvi = cv[i];
            if (cvi < colFieldNo && cvi > cv[closestIndex]) {
                closestIndex = i;
            }
        }
        cv.splice(closestIndex + 1, 0, colFieldNo);
        gh.refreshHeaderAndBody();
    }

    export function handleHideColumn(evt: Event, cascadeInfo: b.ICascadingHandler) {        
        if (cascadeInfo.timeStamp === evt.timeStamp) return;
        cascadeInfo.timeStamp = evt.timeStamp;
        var gh = new gridHelper(evt, cascadeInfo);
        var colNo = gh.getColNo();
        var dt = gh.getDataTable();
        var colFieldNo = gh.getColFieldNo(colNo, dt);
        gh.hideColumn(colFieldNo, dt);
        //var colFieldNo = 0;
        //if (!dt.colView) {
        //    colFieldNo = colNo;
        //    var colView: number[] = [];
        //    for (var i = 0, n = dt.fields.length; i < n; i++) {
        //        if (i != colNo) {
        //            colView.push(i);
        //        }
        //    }
        //    dt.colView = colView;
        //} else {
        //    colFieldNo = dt.colView[colNo];
        //    dt.colView.splice(colNo, 1);
        //}
        //console.log('colFieldNo = ' + colFieldNo);
        //gh.refreshHeaderAndBody();
        
        var ft =  gh._fgo.columnRemove.formTargets;
        if (ft) {
            if (ft.id) { //assume form element
                var frm = <HTMLFormElement> ft;
                var chkBoxId = 'tsp_cs_col_ck_box_' + colFieldNo;
                var lblId = 'tsp_cs_col_lbl_' + colFieldNo;
                var inp = <HTMLElement> frm.querySelector('#' + chkBoxId);
                var lbl = <HTMLElement> frm.querySelector('#' + lblId);
                if (!inp) {
                    var fld = dt.fields[colFieldNo];
                    var colText = fld.header ? fld.header : fld.name;
                    var emmetS = 'input#{id}[type="checkbox"]+label#{lblId}[for="{id}"]{{colText}}';
                    emmetS = db.format(emmetS, {
                        id: chkBoxId,
                        lblId: lblId,
                        colText: colText,
                    });
                    db.$$(emmetS).appendTo(frm);
                    var chkbox = frm.querySelector('#' + chkBoxId);
                    _when('change', {
                        selectorNodeTest: db.format('input#{id}', { id: chkBoxId }),
                        handler: handleToggleColumn,
                        data: {
                            cascadeInfo: cascadeInfo,
                            colFieldNo: colFieldNo,
                        }
                    });
                }
            }
        }
    }
    //#endregion

    function getOrCreateFormElements$(targetForms$: JQuery, fldName: string): HTMLInputElement[] {
        var returnObj: HTMLInputElement[] = [];
        targetForms$.each((idx, frm) => {
            var inpFlds = frm.querySelectorAll('input[name="' + fldName + '"]');
            var inpFld: HTMLInputElement;
            if (inpFlds.length == 0) {
                inpFld = <HTMLInputElement> document.createElement('input');
                inpFld.type = 'hidden';
                inpFld.name = fldName;
                frm.appendChild(inpFld);
                returnObj.push(inpFld);
            } else {
                for (var i = 0, n = inpFlds.length; i < n; i++) {
                    returnObj.push(<HTMLInputElement> inpFlds[i]);
                }
            }
        });
        return returnObj;
    }

    //#region Grid Support

    //#region Scroll Support
    export function sizeScroll(el: HTMLElement, scrollOptions?: tsp.b.IScrollOptions, innerDiv?: HTMLDivElement) {
        //console.log('tsp.cs.sizeScroll');
        if (!scrollOptions) scrollOptions = <tsp.b.IScrollOptions> db.extractDirective(el, 'scrollOptions');
        if (!innerDiv) innerDiv = <HTMLDivElement> el.firstChild;
        var maxValue = scrollOptions.maxValueFn ? scrollOptions.maxValueFn() : scrollOptions.maxValue;
        //console.log('maxValue = ' + maxValue);
        var innerDim = scrollOptions.maxElementSize * maxValue;
        //console.log('innerDim = ' + innerDim);
        var styleDim = (scrollOptions.direction == b.DirectionOptions.Vertical ? 'height' : 'width');
        innerDiv.style[styleDim] = innerDim + 'px';
    }

    

    export function addDisplayOnHover(el: HTMLElement) {
        var displayOnHoverOptions = <b.IDisplayOnHoverOptions> db.extractDirective(el, 'displayOnHoverOptions');
        if (!displayOnHoverOptions) return;
        displayOnHoverOptions.targetID = db.getOrCreateID(el);
        var ch: b.ICascadingHandler = {
            selectorNodeTest: displayOnHoverOptions.hotspotSelector,
            handler: handleDisplayOnHover,
            data: displayOnHoverOptions
        };
        _when('mousemove', ch);
        var ch2: b.ICascadingHandler = {
            handler: handleCloseOnClickOut,
            selectorNodeVoidTest: '#' + db.getOrCreateID(el),
        };
        _when('click', ch2);
    }

    export function addScroll(el: HTMLElement) {
        var scrollOptions = <b.IScrollOptions> db.extractDirective(el, 'scrollOptions');
        scrollOptions.elementID = db.getOrCreateID(el);
        //el.style.height = ['height'] + 'px';
        var innerDiv = <HTMLDivElement> document.createElement('div');
        innerDiv.innerHTML = '&nbsp';
        var overFl = (scrollOptions.direction == b.DirectionOptions.Vertical ? 'Y' : 'X');
        el.style['overflow' + overFl] = 'auto';
        sizeScroll(el, scrollOptions, innerDiv);
        el.appendChild(innerDiv);
        var ft = scrollOptions.formTargets;
        if (ft) {
            el.addEventListener('scroll', handleScroll, false);
        }
        subscribeToScrollDimensionChange(scrollOptions);
    }

    function subscribeToScrollDimensionChange(scrollOptions: b.IScrollOptions) {
        var nl = scrollOptions.maxValueChangeNotifier;
        if (nl) {
            nl.addChangeListener(function (d: b.IDataTable) {
                sizeScroll(document.getElementById(scrollOptions.elementID));
            });
        }
    }

    function verticalOffsetChangeHandler(verticalOffsetFld: HTMLElement) {
        var dgs = <HTMLElement[]> db.data(verticalOffsetFld).dependantGrids;
        for (var i = 0, n = dgs.length; i < n; i++) {
            var el = dgs[i];
            var fgo = <tsp.b.IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
            b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }

    function horizontalOffsetChangeHandler(horizontalOffsetFld: HTMLInputElement) {
        var dgs = <HTMLElement[]> db.data(horizontalOffsetFld).dependantGrids;
        for (var i = 0, n = dgs.length; i < n; i++) {
            var el = dgs[i];
            var fgo = <tsp.b.IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
            b.refreshHeaderTemplateWithRectCoords(el, fgo);
            b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }


    //#endregion

    //#region Tree Grid Support

    export function addTreeGridNodeToggle(el: HTMLElement) {
        _when('click', {
            containerID: db.getOrCreateID(el),
            handler: handleTreeNodeToggle,
            selectorNodeTest: 'span.treeNodeToggler',
        });
    }

    //#endregion

    

    export function fillGrid(el: HTMLElement) {
        var fgo = b.fillGrid(el);
        switch (fgo.treeColumn) {
            case b.TreeType.simple:
                addTreeGridNodeToggle(el);   
        }
        if (fgo.verticalOffsetFld) {
            if (db.isCSMode()) {
                var vof = fgo.verticalOffsetFld;
                var vofd = db.data(vof);
                if (!vofd.dependantGrids) {
                    vofd.dependantGrids = [];
                }
                vofd.dependantGrids.push(el);
                DBS.cs.onPropChange(fgo.verticalOffsetFld, 'value', verticalOffsetChangeHandler);
                
            }

        }
        if (fgo.horizontalOffsetFld) {
            if (db.isCSMode()) {
                var hof = fgo.horizontalOffsetFld;
                var hofd = db.data(hof);
                if (!hofd.dependantGrids) {
                    hofd.dependantGrids = [];
                }
                hofd.dependantGrids.push(el);
                DBS.cs.onPropChange(fgo.horizontalOffsetFld, 'value', horizontalOffsetChangeHandler);
            }
        }
        //if (fgo.columnRemove) {
        //    //var colRemovers = el.querySelectorAll(fgo.columnRemove.selector);
        //    //for (var i = 0, n = colRemovers.length; i < n; i++) {
        //    //    var colRemover = colRemovers[i];
        //    //    colRemover.addEventListener('click', fgo.columnRemove.removeHandler);
        //    //}
        //    console.log('attach click event');
        //    _when('click', {
        //        selectorNodeTest: fgo.columnRemove.selector,
        //        containerID: db.getOrCreateID(el),
        //        handler: fgo.columnRemove.handler
        //    });
        //}
        attachIActObj(fgo.columnRemove, 'click', el);
        attachIActObj(fgo.columnLock,   'click', el);
    }

    function attachIActObj(obj: b.IActOptions, evtName: string, container: HTMLElement) {
        if (!obj) return;
        _when(evtName, {
            selectorNodeTest: obj.selector,
            containerID: db.getOrCreateID(container),
            handler: obj.handler
        });
    }


    //#endregion
 
       //#region css selector-based event handling
    var matchesSelector = function (node, selector) {
        var nodeList = node.parentNode.querySelectorAll(selector),
            length = nodeList.length,
            i = 0;
        while (i < length) {
            if (nodeList[i] == node) return true;
            ++i;
        }
        return false;
    };

    export function _when(eventName: string, cascadingHandler: b.ICascadingHandler) {
        console.log('_when ' + eventName + 'node Test ' + cascadingHandler.selectorNodeTest);
        var el: HTMLElement;
        if (cascadingHandler.containerID) {
            el = document.getElementById(cascadingHandler.containerID);
        } else if (cascadingHandler.container) {
            el = cascadingHandler.container;
        } else {
            el = document.body;
        }
        //var eventHandlers = handlers[eventName];
        var eventHandlers: { [key: string]: b.ICascadingHandler[]; } = db.data(el).handlers;
        if (!eventHandlers) {
            eventHandlers = {};
            db.data(el).handlers = eventHandlers;
        }
        var eventHandler = eventHandlers[eventName];
        if (!eventHandler) {
            eventHandler = [];
            eventHandlers[eventName] = eventHandler;
            if (el.attachEvent) {
                el.attachEvent('on' + eventName, handleCascadingEvent);
            } else {
                el.addEventListener(eventName, handleCascadingEvent);
            }
        }
        eventHandler[eventHandler.length] = cascadingHandler;
        return tsp.cs;
    }

    //#endregion
}
 