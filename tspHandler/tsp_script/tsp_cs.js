///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='../Scripts/typings/underscore/underscore.d.ts'/>
///<reference path='tsp_b.ts'/>
///<reference path='DBS_cs.ts'/>
var tsp;
(function (tsp) {
    (function (cs) {
        var db = DBS.b;
        var b = tsp.b;

        //#region Interfaces
        //#endregion
        //#region Event Handlers
        function handleCascadingEvent(evt) {
            var el = evt.srcElement;

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
                                var cascadeHandler = evtHandler[i];
                                if (cascadeHandler.selectorNodeVoidTest) {
                                    var containerEl;
                                    if (cascadeHandler.containerID) {
                                        containerEl = document.querySelector(cascadeHandler.containerID);
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
                                            testChild = testChild.parentNode;
                                        }
                                        if (bIsContainer)
                                            continue;
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
                                    } else {
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
                el = el.parentNode;
                if (bCheckedBody)
                    return;
            }
        }

        function handleCloseOnClickOut(evt, cascadeHandler) {
            $(cascadeHandler.selectorNodeVoidTest).hide();
        }

        function handleScroll(evt) {
            //console.log(evt);
            var src = evt.srcElement;
            var scrollOptions = DBS.b.data(src)['scrollOptions'];
            var newVal;
            switch (scrollOptions.direction) {
                case 1 /* Horizontal */:
                    newVal = Math.floor(src.scrollLeft / scrollOptions.maxElementSize);
                    break;
                case 0 /* Vertical */:
                    newVal = Math.floor(src.scrollTop / scrollOptions.maxElementSize);
                    break;
            }

            if (newVal !== scrollOptions.currentValue) {
                //console.log(newVal);
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

        function toggleNode(nd, dt, data, bCheckItem) {
            var n = b.nodeIdxes;
            if (!dt.nodeToRowIdxMapping) {
                b.mapParentChildRel(dt, b.getNodeFldIdx(dt));
            }
            var colIdx = b.getNodeFldIdx(dt);
            if (nd[4 /* numChildren */] == 0) {
                //#region number of children = 0
                if (typeof (bCheckItem) == 'undefined') {
                    if (typeof (nd[5 /* selected */]) == 'undefined') {
                        nd[5 /* selected */] = 2;
                    } else {
                        nd[5 /* selected */] = 2 - nd[5 /* selected */];
                    }
                } else {
                    nd[5 /* selected */] = bCheckItem ? 2 : 0;
                }
                var parentId = nd[2 /* parentId */];

                var parentRowNo = dt.nodeToRowIdxMapping[parentId];

                while (parentRowNo != null) {
                    var parentNd = data[parentRowNo][colIdx];

                    //parentNd[n.selected] = 1;
                    //debugger;
                    //console.log('parentRowNo = ' + parentRowNo);
                    parentNd[5 /* selected */] = null;

                    //debugger;
                    var sel = b.getTriStateForParentNode(parentNd, dt, colIdx);
                    parentNd[5 /* selected */] = sel;

                    //console.log('sel = ' + sel);
                    parentId = parentNd[2 /* parentId */];
                    parentRowNo = dt.nodeToRowIdxMapping[parentId];
                }
                //#endregion
            } else {
                var children = dt.parentToChildMapping[nd[1 /* id */]];
                if (!children) {
                    debugger;
                }
                var bCheckChildItem;
                if (typeof (bCheckItem) == 'undefined') {
                    bCheckChildItem = (typeof (nd[5 /* selected */]) == 'undefined') || nd[5 /* selected */] < 2;
                } else {
                    bCheckChildItem = bCheckItem;
                }

                for (var i = 0, l = children.length; i < l; i++) {
                    var childRowNo = children[i];
                    var child = data[childRowNo];
                    var childNd = child[colIdx];
                    toggleNode(childNd, dt, data, bCheckChildItem);
                }
            }
        }

        function handleTreeNodeGridSelectToggle(evt, cascadeInfo) {
            if (evt.timeStamp && (cascadeInfo.timeStamp === evt.timeStamp))
                return;
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

        function handleTreeNodeToggle(evt, cascadeInfo) {
            if (evt.timeStamp && (cascadeInfo.timeStamp === evt.timeStamp))
                return;
            cascadeInfo.timeStamp = evt.timeStamp;
            var gh = new gridHelper(evt, cascadeInfo);
            var dt = gh.getDataTable();
            var dtRow = gh.getDataRow(dt);
            var $evtEl = $(gh._evtEl);

            //$evtEl.toggleClass('fa-plus-square-o').toggleClass('fa-minus-square-o');
            var nd = gh.getTreeNode(dt, dtRow);
            var numChildren = nd[4 /* numChildren */];
            nd[4 /* numChildren */] = -1 * numChildren;
            b.applyTreeView(gh._templEl, gh._fgo);
            b.refreshBodyTemplateWithRectCoords(gh._templEl, null, gh._fgo);
            if (dt.changeNotifier)
                dt.changeNotifier.notifyListeners(dt);
        }

        function handleDisplayOnHover(evt, cascadeInfo) {
            var evtEl = evt.srcElement;
            var doho = cascadeInfo.data;
            $('#' + doho.targetID).show();
        }

        function handleToggleLockColumn(evt, cascadeInfo) {
            if (cascadeInfo.timeStamp === evt.timeStamp)
                return;
            cascadeInfo.timeStamp = evt.timeStamp;
            var gh = new gridHelper(evt, cascadeInfo);
            var dt = gh.getDataTable();
            var colNo = gh.getColNo();
            var colFieldNo = gh.getColFieldNo(colNo, dt);
            if (!dt.frozenCol)
                dt.frozenCol = {};
            dt.frozenCol['' + (colNo + 1)] = colFieldNo;
            gh.hideColumn(colFieldNo, dt);
        }
        cs.handleToggleLockColumn = handleToggleLockColumn;

        function handleMoveColumnLeft(evt, cascadeInfo) {
            handleMoveColumn(evt, cascadeInfo, -1);
        }
        cs.handleMoveColumnLeft = handleMoveColumnLeft;

        function handleMoveColumnRight(evt, cascadeInfo) {
            handleMoveColumn(evt, cascadeInfo, 1);
        }
        cs.handleMoveColumnRight = handleMoveColumnRight;

        function handleMoveColumn(evt, cascadeInfo, dir) {
            if (cascadeInfo.timeStamp === evt.timeStamp)
                return;
            cascadeInfo.timeStamp = evt.timeStamp;
            var gh = new gridHelper(evt, cascadeInfo);
            var dt = gh.getDataTable();
            gh.initiateColView(dt);
            var colNo = gh.getColNo();
            var colFieldNo = gh.getColFieldNo(colNo, dt);
            gh.moveColumn(colFieldNo, dt, dir);
        }
        cs.handleMoveColumn = handleMoveColumn;

        //export function handleAsyncModelLoad(e) {
        //    var evt = window.event;
        //}
        var gridHelper = (function () {
            function gridHelper(evt, cascadeInfo) {
                this._evt = evt;
                this._ci = cascadeInfo;
                this._evtEl = this._evt.srcElement;
                this._templEl = document.getElementById(this._ci.containerID);
                this._fgo = db.extractDirective(this._templEl, 'fillGridOptions');
            }
            //getFillGridOptions() : b.IFillGridOptions {
            //    return this._fgo;
            //}
            gridHelper.prototype.refreshHeaderAndBody = function () {
                b.refreshHeaderTemplateWithRectCoords(this._templEl, this._fgo);
                b.refreshBodyTemplateWithRectCoords(this._templEl, this._fgo.verticalOffsetFld, this._fgo);
            };
            gridHelper.prototype.getDataTable = function () {
                return this._fgo.dataTableFn(this._templEl);
            };
            gridHelper.prototype.getDataRow = function (dt) {
                var dataCell = this._evtEl;
                var rc = dataCell.getAttribute('data-rc');
                while (dataCell && !rc) {
                    dataCell = dataCell.parentNode;
                    rc = dataCell.getAttribute('data-rc');
                }
                if (!dataCell)
                    return null;
                var rowNo = parseInt(rc.split(',')[0]) - 1;
                var dtRow = dt.data[dt.rowView[rowNo]];
                return dtRow;
            };
            gridHelper.prototype.getTreeNode = function (dt, dtRow) {
                var ndFldIdx = b.getNodeFldIdx(dt);
                return dtRow[ndFldIdx];
            };
            gridHelper.prototype.getColNo = function () {
                var actionCell = this._evtEl;
                var ac = actionCell.getAttribute('data-ac');
                while (actionCell && !ac) {
                    actionCell = actionCell.parentNode;
                    ac = actionCell.getAttribute('data-ac');
                }
                var colNo = parseInt(ac.split(',')[1]) - 1;
                return colNo;
            };
            gridHelper.prototype.getColFieldNo = function (colNo, dt) {
                var co = this.getColOffset();
                var virtualColNo = colNo + co;
                if (dt.colView) {
                    return dt.colView[virtualColNo];
                }
                return virtualColNo;
            };
            gridHelper.prototype.getColOffset = function () {
                var fgo = this._fgo;
                return (fgo && fgo.horizontalOffsetFld && fgo.horizontalOffsetFld.value.length > 0) ? parseInt(fgo.horizontalOffsetFld.value) : 0;
            };
            gridHelper.prototype.initiateColView = function (dt) {
                if (!dt.colView) {
                    var colView = [];
                    for (var i = 0, n = dt.fields.length; i < n; i++) {
                        colView.push(i);
                    }
                    dt.colView = colView;
                }
            };
            gridHelper.prototype.hideColumn = function (colFieldNo, dt) {
                //console.log('hide ' + colFieldNo);
                this.initiateColView(dt);
                dt.colView.splice(colFieldNo, 1);
                this.refreshHeaderAndBody();
                if (dt.changeNotifier)
                    dt.changeNotifier.notifyListeners(dt);
            };
            gridHelper.prototype.moveColumn = function (colFieldNo, dt, places) {
                var colView = dt.colView;
                switch (places) {
                    case -1:
                        if (colFieldNo == 0)
                            return;
                        break;
                    case 1:
                        if (colFieldNo >= colView.length - 1)
                            return;
                        break;
                }
                var tmp = colView[colFieldNo + places];
                colView[colFieldNo + places] = colView[colFieldNo];
                colView[colFieldNo] = tmp;
                this.refreshHeaderAndBody();
            };
            return gridHelper;
        })();

        function handleToggleColumn(evt, cascadeInfo) {
            var subCI = cascadeInfo.data.cascadeInfo;
            var colFieldNo = cascadeInfo.data.colFieldNo;
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
        cs.handleToggleColumn = handleToggleColumn;

        function handleHideColumn(evt, cascadeInfo) {
            if (cascadeInfo.timeStamp === evt.timeStamp)
                return;
            cascadeInfo.timeStamp = evt.timeStamp;
            var gh = new gridHelper(evt, cascadeInfo);
            var colNo = gh.getColNo();
            var dt = gh.getDataTable();
            var colFieldNo = gh.getColFieldNo(colNo, dt);
            gh.hideColumn(colFieldNo, dt);

            var ft = gh._fgo.columnRemove.formTargets;
            if (ft) {
                if (ft.id) {
                    var frm = ft;
                    var chkBoxId = 'tsp_cs_col_ck_box_' + colFieldNo;
                    var lblId = 'tsp_cs_col_lbl_' + colFieldNo;
                    var inp = frm.querySelector('#' + chkBoxId);
                    var lbl = frm.querySelector('#' + lblId);
                    if (!inp) {
                        var fld = dt.fields[colFieldNo];
                        var colText = fld.header ? fld.header : fld.name;
                        var emmetS = 'input#{id}[type="checkbox"]+label#{lblId}[for="{id}"]{{colText}}';
                        emmetS = db.format(emmetS, {
                            id: chkBoxId,
                            lblId: lblId,
                            colText: colText
                        });
                        db.$$(emmetS).appendTo(frm);
                        var chkbox = frm.querySelector('#' + chkBoxId);
                        _when('change', {
                            selectorNodeTest: db.format('input#{id}', { id: chkBoxId }),
                            handler: handleToggleColumn,
                            data: {
                                cascadeInfo: cascadeInfo,
                                colFieldNo: colFieldNo
                            }
                        });
                    }
                }
            }
        }
        cs.handleHideColumn = handleHideColumn;

        //#endregion
        function getOrCreateFormElements$(targetForms$, fldName) {
            var returnObj = [];
            targetForms$.each(function (idx, frm) {
                var inpFlds = frm.querySelectorAll('input[name="' + fldName + '"]');
                var inpFld;
                if (inpFlds.length == 0) {
                    inpFld = document.createElement('input');
                    inpFld.type = 'hidden';
                    inpFld.name = fldName;
                    frm.appendChild(inpFld);
                    returnObj.push(inpFld);
                } else {
                    for (var i = 0, n = inpFlds.length; i < n; i++) {
                        returnObj.push(inpFlds[i]);
                    }
                }
            });
            return returnObj;
        }

        //#region Grid Support
        //#region Scroll Support
        function sizeScroll(el, scrollOptions, innerDiv) {
            //console.log('tsp.cs.sizeScroll');
            if (!scrollOptions)
                scrollOptions = db.extractDirective(el, 'scrollOptions');
            if (!innerDiv)
                innerDiv = el.firstChild;
            var maxValue = scrollOptions.maxValueFn ? scrollOptions.maxValueFn() : scrollOptions.maxValue;

            //console.log('maxValue = ' + maxValue);
            var innerDim = scrollOptions.maxElementSize * maxValue;

            //console.log('innerDim = ' + innerDim);
            var styleDim = (scrollOptions.direction == 0 /* Vertical */ ? 'height' : 'width');
            innerDiv.style[styleDim] = innerDim + 'px';
        }
        cs.sizeScroll = sizeScroll;

        function addDisplayOnHover(el) {
            var displayOnHoverOptions = db.extractDirective(el, 'displayOnHoverOptions');
            if (!displayOnHoverOptions)
                return;
            displayOnHoverOptions.targetID = db.getOrCreateID(el);
            var ch = {
                selectorNodeTest: displayOnHoverOptions.hotspotSelector,
                handler: handleDisplayOnHover,
                data: displayOnHoverOptions
            };
            _when('mousemove', ch);
            var ch2 = {
                handler: handleCloseOnClickOut,
                selectorNodeVoidTest: '#' + db.getOrCreateID(el)
            };
            _when('click', ch2);
        }
        cs.addDisplayOnHover = addDisplayOnHover;

        function addScroll(el) {
            var scrollOptions = db.extractDirective(el, 'scrollOptions');
            scrollOptions.elementID = db.getOrCreateID(el);

            //el.style.height = ['height'] + 'px';
            var innerDiv = document.createElement('div');
            innerDiv.innerHTML = '&nbsp';
            var overFl = (scrollOptions.direction == 0 /* Vertical */ ? 'Y' : 'X');
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
        cs.addScroll = addScroll;

        function subscribeToScrollDimensionChange(scrollOptions) {
            var nl = scrollOptions.maxValueChangeNotifier;
            if (nl) {
                nl.addChangeListener(function (d) {
                    sizeScroll(document.getElementById(scrollOptions.elementID));
                });
            }
        }

        function verticalOffsetChangeHandler(verticalOffsetFld) {
            var dgs = db.data(verticalOffsetFld).dependantGrids;
            for (var i = 0, n = dgs.length; i < n; i++) {
                var el = dgs[i];
                var fgo = db.extractDirective(el, 'fillGridOptions');
                b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
            }
        }

        function horizontalOffsetChangeHandler(horizontalOffsetFld) {
            var dgs = db.data(horizontalOffsetFld).dependantGrids;
            for (var i = 0, n = dgs.length; i < n; i++) {
                var el = dgs[i];
                var fgo = db.extractDirective(el, 'fillGridOptions');
                b.refreshHeaderTemplateWithRectCoords(el, fgo);
                b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
            }
        }

        //#endregion
        //#region Tree Grid Support
        function addTreeGridNodeToggle(el) {
            _when('click', {
                containerID: db.getOrCreateID(el),
                handler: handleTreeNodeToggle,
                selectorNodeTest: 'span.treeNodeToggler'
            });
        }
        cs.addTreeGridNodeToggle = addTreeGridNodeToggle;

        function addTreeGridSelectToggle(el) {
            _when('click', {
                containerID: db.getOrCreateID(el),
                handler: handleTreeNodeGridSelectToggle,
                selectorNodeTest: 'span.treeNodeSelector'
            });
        }
        cs.addTreeGridSelectToggle = addTreeGridSelectToggle;

        //#endregion
        function fillGrid(el) {
            var fgo = b.fillGrid(el);
            switch (fgo.treeColumn) {
                case 2 /* triState */:
                    addTreeGridSelectToggle(el);
                    addTreeGridNodeToggle(el);
                    break;
                case 1 /* simple */:
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
        cs.fillGrid = fillGrid;

        function attachIActObj(obj, evtName, container) {
            if (!obj)
                return;
            _when(evtName, {
                selectorNodeTest: obj.selector,
                containerID: db.getOrCreateID(container),
                handler: obj.handler
            });
        }

        //#endregion
        //#region css selector-based event handling
        var matchesSelector = function (node, selector) {
            var nodeList = node.parentNode.querySelectorAll(selector), length = nodeList.length, i = 0;
            while (i < length) {
                if (nodeList[i] == node)
                    return true;
                ++i;
            }
            return false;
        };

        function _when(eventName, cascadingHandler) {
            //console.log('_when ' + eventName + 'node Test ' + cascadingHandler.selectorNodeTest);
            var el;
            if (cascadingHandler.containerID) {
                el = document.getElementById(cascadingHandler.containerID);
            } else if (cascadingHandler.container) {
                el = cascadingHandler.container;
            } else {
                el = document.body;
            }

            //var eventHandlers = handlers[eventName];
            var eventHandlers = db.data(el).handlers;
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
        cs._when = _when;
    })(tsp.cs || (tsp.cs = {}));
    var cs = tsp.cs;
})(tsp || (tsp = {}));
//# sourceMappingURL=tsp_cs.js.map
