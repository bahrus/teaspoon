///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_b.ts'/>
///<reference path='DBS_cs.ts'/>



module tsp.cs {

    var db = DBS.b;
    var b = tsp.b;


    //#region Interfaces
    export interface ICascadingHandler {
        selectorNodeTest?: string;
        handler: (evt: Event, cascadingHandlerInfo: ICascadingHandler) => void;
        //test?: (el: HTMLElement) => boolean;
        containerID?: string;
        container?: HTMLElement;
        data?: any;
    }
    //#endregion

    //#region Event Handlers
    function handleCascadingEvent(evt: Event) {
        var el = <HTMLElement> evt.srcElement;
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
                            var cascadeHandler = evtHandler[i];
                            var doesMatch = false;
                            if (cascadeHandler.selectorNodeTest) {
                                //var matchor = el['mozMatchesSelector'] || el['webkitMatchesSelector'] || el.msMatchesSelector;
                                if (evtEl.msMatchesSelector) {
                                    doesMatch = evtEl.msMatchesSelector(cascadeHandler.selectorNodeTest);
                                } else {//need to test other browsers with native support
                                    doesMatch = matchesSelector(evtEl, cascadeHandler.selectorNodeTest);
                                }
                            }
                            if (doesMatch) {
                                cascadeHandler.handler(evt, cascadeHandler);
                                return;
                            }
                        }
                    }
                }
            }
            el = <HTMLElement> el.parentNode;
            if (bCheckedBody) return;
        }


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

    function handleTreeNodeToggle(evt: Event, cascadeInfo: ICascadingHandler) {
        var evtEl = evt.srcElement;
        var $evtEl = $(evtEl);
        $evtEl.toggleClass('plus').toggleClass('minus');
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
        var dt = rule.getDataTable(templEl);
        //var dtRow = dt.data[rowNo];
        var dtRow = dt.data[dt.rowView[rowNo]];
        var ndFldIdx = b.getNodeFldIdx(dt);
        var nd = dtRow[ndFldIdx];
        var numChildren = nd[b.nodeIdxes.numChildren];
        nd[b.nodeIdxes.numChildren] = -1 * numChildren;
        b.applyTreeView(templEl, rule);
        b.refreshBodyTemplateWithRectCoords(templEl, null, rule);
        db.notifyListeners(dt);
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

    //#region Scroll Support
    export function sizeScroll(el: HTMLElement, scrollOptions?: tsp.b.IScrollOptions, innerDiv?: HTMLDivElement) {
        console.log('tsp.cs.sizeScroll');
        if (!scrollOptions) scrollOptions = <tsp.b.IScrollOptions> db.extractDirective(el, 'scrollOptions');
        if (!innerDiv) innerDiv = <HTMLDivElement> el.firstChild;
        var maxValue = scrollOptions.maxValueFn ? scrollOptions.maxValueFn() : scrollOptions.maxValue;
        console.log('maxValue = ' + maxValue);
        var innerDim = scrollOptions.maxElementSize * maxValue;
        console.log('innerDim = ' + innerDim);
        var styleDim = (scrollOptions.direction == b.DirectionOptions.Vertical ? 'height' : 'width');
        innerDiv.style[styleDim] = innerDim + 'px';
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
        console.log('tsp.cs.subscribeToScrollDimensionChange:  nl = ' + nl);
        if (nl) {
            nl.addChangeListener(function (d: b.IDataTable) {

                sizeScroll(document.getElementById(scrollOptions.elementID));
            });
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

    

    export function _when(eventName: string, cascadingHandler: ICascadingHandler) {
        //if (!pageisloaded) {
        //    window.addEventListener('load', function () {
        //        pageisloaded = 1;
        //        _when(eventName, cascadingHandler);
        //    });
        //    return;
        //}
        var el: HTMLElement;
        if (cascadingHandler.containerID) {
            el = document.getElementById(cascadingHandler.containerID);
        } else if (cascadingHandler.container) {
            el = cascadingHandler.container;
        } else {
            el = document.body;
        }
        //var eventHandlers = handlers[eventName];
        var eventHandlers: { [key: string]: ICascadingHandler[]; } = db.data(el).handlers;
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
    }
}
 