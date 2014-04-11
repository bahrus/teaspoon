///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_b.ts'/>
///<reference path='DBS_cs.ts'/>



module tsp.cs {

    var db = DBS.b;

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

    export function addScroll(el: HTMLElement) {
        var scrollOptions = <tsp.b.IScrollOptions> DBS.b.extractDirective(el, 'scrollOptions');
        //el.style.height = ['height'] + 'px';
        var innerDiv = document.createElement('div');
        innerDiv.innerHTML = '&nbsp';
        switch (scrollOptions.direction) {
            case tsp.b.DirectionOptions.Vertical:
                el.style.overflowY = 'auto';
                var outerHeight = el.clientHeight;
                var innerHeight = scrollOptions.maxElementSize * scrollOptions.maxValue;
                innerDiv.style.height = innerHeight + 'px';
                break;
            case tsp.b.DirectionOptions.Horizontal:
                el.style.overflowX = 'auto';
                var outerWidth = el.clientWidth;
                var innerWidth = scrollOptions.maxElementSize * scrollOptions.maxValue;

                innerDiv.style.width = innerWidth + 'px';
                break;
        }

        el.appendChild(innerDiv);
        var ft = scrollOptions.formTargets;
        if (ft) {

            el.addEventListener('scroll', scrollListener, false);

            //el.attachEvent('scroll', scrollListener);
        }
    }

    export function addTreeNodeToggle(el: HTMLElement) {
        _when('click', {
            containerID: db.getOrCreateID(el),
            handler: handleTreeNodeToggle,
            selectorNodeTest: 'span.treeNodeToggler',
        });
    }

    function scrollListener(evt: Event) {

        //console.log(evt);
        var src = <HTMLDivElement> evt.srcElement;
        var scrollOptions = <tsp.b.IScrollOptions> DBS.b.data(src)['scrollOptions'];
        var newVal;
        switch (scrollOptions.direction) {
            case tsp.b.DirectionOptions.Horizontal:
                newVal = Math.floor(src.scrollLeft / scrollOptions.maxElementSize);
                break;
            case tsp.b.DirectionOptions.Vertical:
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


    export function fillGrid(el: HTMLElement) {
        var fgo = tsp.b.fillGrid(el);
        switch (fgo.treeColumn) {
            case tsp.b.TreeType.simple:
                addTreeNodeToggle(el);   
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
            tsp.b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }

    function horizontalOffsetChangeHandler(horizontalOffsetFld: HTMLInputElement) {
        var dgs = <HTMLElement[]> db.data(horizontalOffsetFld).dependantGrids;
        for (var i = 0, n = dgs.length; i < n; i++) {
            var el = dgs[i];
            var fgo = <tsp.b.IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
            tsp.b.refreshHeaderTemplateWithRectCoords(el, fgo);
            tsp.b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }

    export interface ICascadingHandler {
        selectorNodeTest?: string;
        handler: (evt: Event, cascadingHandlerInfo: ICascadingHandler) => void;
        //test?: (el: HTMLElement) => boolean;
        containerID?: string;
        container?: HTMLElement;
        data?: any;
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
        var dtRow = dt.data[rowNo];
        var ndFldIdx = tsp.b.getNodeFldIdx(dt);
        var nd = dtRow[ndFldIdx];
        var numChildren = nd[tsp.b.nodeIdxes.numChildren];
        nd[tsp.b.nodeIdxes.numChildren] = -1 * numChildren;
        tsp.b.applyTreeView(templEl, rule);
        tsp.b.refreshBodyTemplateWithRectCoords(templEl, null, rule);
    }

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
 