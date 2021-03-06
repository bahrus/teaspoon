﻿///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
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
                console.log('scrollTop  = ' + (src.scrollTop /*+ src.clientHeight */));
                newVal = Math.floor((src.scrollTop /*+ src.clientHeight*/) / scrollOptions.maxElementSize);
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
                if (fld.hasAttribute('leh')) {
                    var leh = db.data(fld)['legacyEventHandler'];
                    leh(fld);
                }
            }
        }
    }

    function toggleNode(nd: any, dt: b.IDataTable, data: any[], bCheckItem?: boolean) {
        var n = b.nodeIdxes;
        if (!dt.nodeToRowIdxMapping) {
            b.mapParentChildRel(dt, b.getNodeFldIdx(dt));
        }
        var colIdx = b.getNodeFldIdx(dt);
        if (nd[n.numChildren] == 0) {
            //#region number of children = 0
            if (typeof (bCheckItem) == 'undefined') {
                if (typeof (nd[n.selected]) == 'undefined') {
                    nd[n.selected] = 2;
                } else {
                    nd[n.selected] = 2 - nd[n.selected];
                }
            } else {
                nd[n.selected] = bCheckItem ? 2 : 0;
            }
            var parentId = nd[n.parentId];
            
            var parentRowNo = dt.nodeToRowIdxMapping[parentId];
            
            while (parentRowNo != null) {
                var parentNd = data[parentRowNo][colIdx];
                //parentNd[n.selected] = 1;
                //debugger;
                //console.log('parentRowNo = ' + parentRowNo);
                parentNd[n.selected] = null;
                //debugger;
                var sel = b.getTriStateForParentNode(parentNd, dt, colIdx);
                parentNd[n.selected] = sel;
                //console.log('sel = ' + sel);
                parentId = parentNd[n.parentId];
                parentRowNo = dt.nodeToRowIdxMapping[parentId];
            }
            //#endregion
        } else {
            var children = dt.parentToChildMapping[nd[n.id]];
            if (!children) {
                debugger;
            }
            var bCheckChildItem;
            if (typeof (bCheckItem) == 'undefined') {
                bCheckChildItem = (typeof (nd[n.selected]) == 'undefined') || nd[n.selected] < 2;
            } else {
                bCheckChildItem = bCheckItem;
            }
            //var bUncheckChildren = (typeof (nd[n.selected]) != 'undefined') && nd[n.selected] == 2;
            for (var i = 0, l = children.length; i < l; i++) {
                var childRowNo = children[i];
                var child = data[childRowNo];
                var childNd = child[colIdx];
                toggleNode(childNd, dt, data, bCheckChildItem);
            }
        }
    }

    function handleTreeNodeGridSelectToggle(evt: Event, cascadeInfo: b.ICascadingHandler) {
        if (evt.timeStamp && (cascadeInfo.timeStamp === evt.timeStamp)) return;
        cascadeInfo.timeStamp = evt.timeStamp;
        var gh = new gridHelper(evt, cascadeInfo);
        var dt = gh.getDataTable();
        var data = dt.data;
        var dtRow = gh.getDataRow(dt);
        var nd = gh.getTreeNode(dt, dtRow);
        var $evtEl = $(gh._evtEl);
        toggleNode(nd, dt, data);
        
        b.refreshBodyTemplateWithRectCoords(gh._templEl, null, gh._fgo);
    }

    function handleTreeNodeToggle(evt: Event, cascadeInfo: b.ICascadingHandler) {
        if (evt.timeStamp && (cascadeInfo.timeStamp === evt.timeStamp)) return;
        cascadeInfo.timeStamp = evt.timeStamp;
        var gh = new gridHelper(evt, cascadeInfo);
        var dt = gh.getDataTable();
        var dtRow = gh.getDataRow(dt);
        var $evtEl = $(gh._evtEl);
        //$evtEl.toggleClass('fa-plus-square-o').toggleClass('fa-minus-square-o');
        var nd = gh.getTreeNode(dt, dtRow);
        var numChildren = nd[b.nodeIdxes.numChildren];
        nd[b.nodeIdxes.numChildren] = -1 * numChildren;
        b.applyTreeView(gh._templEl, gh._fgo);
        b.refreshBodyTemplateWithRectCoords(gh._templEl, null, gh._fgo);
        if (dt.changeNotifier) dt.changeNotifier.notifyListeners(dt);
    }

    function handleDisplayOnHover(evt: Event, cascadeInfo: b.ICascadingHandler) {
        var evtEl = evt.srcElement;
        var doho = <b.IDisplayOnHoverOptions> cascadeInfo.data;
        $('#' + doho.targetID).show();
    }

    export function handleToggleLockColumn(evt: Event, cascadeInfo: b.ICascadingHandler) {
        if (cascadeInfo.timeStamp === evt.timeStamp) return;
        cascadeInfo.timeStamp = evt.timeStamp;
        var gh = new gridHelper(evt, cascadeInfo);
        var dt = gh.getDataTable();
        var colNo = gh.getColNo();
        var colFieldNo = gh.getColFieldNo(colNo, dt);
        if (!dt.frozenCol) dt.frozenCol = {};
        dt.frozenCol['' + (colNo + 1)] = colFieldNo;
        gh.hideColumn(colFieldNo, dt);
    }

    export function handleMoveColumnLeft(evt: Event, cascadeInfo: b.ICascadingHandler) {
        handleMoveColumn(evt, cascadeInfo, -1);
    }

    export function handleMoveColumnRight(evt: Event, cascadeInfo: b.ICascadingHandler) {
        handleMoveColumn(evt, cascadeInfo, 1);
    }

    export function handleMoveColumn(evt: Event, cascadeInfo: b.ICascadingHandler, dir: number) {
        if (cascadeInfo.timeStamp === evt.timeStamp) return;
        cascadeInfo.timeStamp = evt.timeStamp;
        var gh = new gridHelper(evt, cascadeInfo);
        var dt = gh.getDataTable();
        gh.initiateColView(dt);
        var colNo = gh.getColNo();
        var colFieldNo = gh.getColFieldNo(colNo, dt);
        gh.moveColumn(colFieldNo, dt, dir);
    }

    //export function handleAsyncModelLoad(e) {
    //    var evt = window.event;
    //}

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
        getDataRow(dt: b.IDataTable): any[]{
            var dataCell = this._evtEl;
            var rc = dataCell.getAttribute('data-rc');
            while (dataCell && !rc) {
                dataCell = <HTMLElement> dataCell.parentNode;
                rc = dataCell.getAttribute('data-rc');
            }
            if (!dataCell) return null;
            var rowNo = parseInt(rc.split(',')[0]) - 1;
            var dtRow = dt.data[dt.rowView[rowNo]];
            return dtRow;
        }
        getTreeNode(dt: b.IDataTable, dtRow: any[]) {
            var ndFldIdx = b.getNodeFldIdx(dt);
            return dtRow[ndFldIdx];
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
        initiateColView(dt: b.IDataTable) {
            if (!dt.colView) {
                var colView: number[] = [];
                for (var i = 0, n = dt.fields.length; i < n; i++) {
                    colView.push(i);
                }
                dt.colView = colView;
            } 
        }
        hideColumn(colFieldNo: number, dt: b.IDataTable) {
            //console.log('hide ' + colFieldNo);
            this.initiateColView(dt);
            dt.colView.splice(colFieldNo, 1);
            this.refreshHeaderAndBody();
            if (dt.changeNotifier) dt.changeNotifier.notifyListeners(dt);
        }
        moveColumn(colFieldNo: number, dt: b.IDataTable, places: number) {
            var colView = dt.colView;
            switch (places) {
                case -1:
                    if (colFieldNo == 0) return;
                    break;
                case 1: 
                    if (colFieldNo >= colView.length - 1) return;     
                    break;
            }
            var tmp = colView[colFieldNo + places];
            colView[colFieldNo + places] = colView[colFieldNo];
            colView[colFieldNo] = tmp;
            this.refreshHeaderAndBody();
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
        //debugger;
        var styleDim = (scrollOptions.direction == b.DirectionOptions.Vertical ? 'height' : 'width');
        var clientDim = (scrollOptions.direction == b.DirectionOptions.Vertical ? 'Height' : 'Width');
        var innerDim = scrollOptions.maxElementSize * (maxValue + 1) + (el['client' + clientDim] - 6 * scrollOptions.maxElementSize);
        console.log('innerDim = ' + innerDim);
        
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
            if (el.addEventListener) {
                el.addEventListener('scroll', handleScroll, false);
            } else {
                el.attachEvent('onscroll', handleScroll);
            }
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

    export function addTreeGridSelectToggle(el: HTMLElement) {
        _when('click', {
            containerID: db.getOrCreateID(el),
            handler: handleTreeNodeGridSelectToggle,
            selectorNodeTest: 'span.treeNodeSelector',
        });
    }

    //#endregion

    

    export function fillGrid(el: HTMLElement) {
        var fgo = b.fillGrid(el);
        switch (fgo.treeColumn) {
            case b.TreeType.triState:
                addTreeGridSelectToggle(el);
                addTreeGridNodeToggle(el); 
                break;
            case b.TreeType.simple:
                addTreeGridNodeToggle(el);
                break;   
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
        attachIActObj(fgo.columnRemove, 'click', el);
        attachIActObj(fgo.columnLock, 'click', el);
        attachIActObj(fgo.columnMoveLeft, 'click', el);
        attachIActObj(fgo.columnMoveRight, 'click', el);
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
        //console.log('_when ' + eventName + 'node Test ' + cascadingHandler.selectorNodeTest);
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
 