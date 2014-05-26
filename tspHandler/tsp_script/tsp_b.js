///<reference path='DBS_b.ts'/>
var tsp;
(function (tsp) {
    (function (b) {
        var db = DBS.b;

        (function (SelectionOptions) {
            SelectionOptions[SelectionOptions["none"] = 0] = "none";
            SelectionOptions[SelectionOptions["single"] = 1] = "single";
            SelectionOptions[SelectionOptions["multiple"] = 2] = "multiple";
        })(b.SelectionOptions || (b.SelectionOptions = {}));
        var SelectionOptions = b.SelectionOptions;

        (function (TitleFillOptions) {
            TitleFillOptions[TitleFillOptions["none"] = 0] = "none";
            TitleFillOptions[TitleFillOptions["text"] = 1] = "text";
        })(b.TitleFillOptions || (b.TitleFillOptions = {}));
        var TitleFillOptions = b.TitleFillOptions;

        

        (function (TreeType) {
            TreeType[TreeType["none"] = 0] = "none";
            TreeType[TreeType["simple"] = 1] = "simple";
            TreeType[TreeType["triState"] = 2] = "triState";
        })(b.TreeType || (b.TreeType = {}));
        var TreeType = b.TreeType;

        (function (DirectionOptions) {
            DirectionOptions[DirectionOptions["Vertical"] = 0] = "Vertical";
            DirectionOptions[DirectionOptions["Horizontal"] = 1] = "Horizontal";
        })(b.DirectionOptions || (b.DirectionOptions = {}));
        var DirectionOptions = b.DirectionOptions;

        (function (nodeIdxes) {
            nodeIdxes[nodeIdxes["text"] = 0] = "text";
            nodeIdxes[nodeIdxes["id"] = 1] = "id";
            nodeIdxes[nodeIdxes["parentId"] = 2] = "parentId";
            nodeIdxes[nodeIdxes["level"] = 3] = "level";
            nodeIdxes[nodeIdxes["numChildren"] = 4] = "numChildren";
            nodeIdxes[nodeIdxes["selected"] = 5] = "selected";
        })(b.nodeIdxes || (b.nodeIdxes = {}));
        var nodeIdxes = b.nodeIdxes;

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
        b.getNodeFldIdx = getNodeFldIdx;

        function applyTreeView(templEl, populateRule) {
            var dt = populateRule.dataTableFn(templEl);
            var expanded = {};
            var treeFldIdx = getNodeFldIdx(dt);
            if (treeFldIdx == -1) {
                populateRule.treeColumn = 0 /* none */;
                return;
            }
            db.data(templEl).treeNodeIndex = treeFldIdx;
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

            //dt.rowDontView = dontView;
            var vSlider = db.data(templEl).slider;
            if (vSlider)
                vSlider.slider('option', 'max', view.length);
            if (dt.changeNotifier)
                dt.changeNotifier.notifyListeners(dt);
        }
        b.applyTreeView = applyTreeView;

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
                    var emmetS = db.format('input[type="hidden"][name="{name}"].{inputName}', {
                        name: inputName.replace('_value', ''),
                        inputName: inputName
                    });
                    db.$$(emmetS).appendTo(frm);

                    //var $inpFld = $(inpFld);
                    //$inpFld.attr('type', 'hidden').attr('name', inputName.replace('_value', '')).addClass(inputName);
                    //frm.appendChild(inpFld);
                    callBack(inpFld);
                } else {
                    for (var j = 0, n1 = inpFlds.length; j < n1; j++) {
                        var inpFld2 = inpFlds[j];
                        callBack(inpFld2);
                    }
                }
            }
        }
        b.getOrCreateHiddenInput = getOrCreateHiddenInput;

        function refreshHeaderTemplateWithRectCoords(el, fillGridOptions) {
            var fgo = fillGridOptions;
            var colOffset = (fgo && fgo.horizontalOffsetFld && fgo.horizontalOffsetFld.value.length > 0) ? parseInt(fgo.horizontalOffsetFld.value) : 0;
            var hcs = el.querySelectorAll('*[data-hc]');
            var dataTable = fgo.dataTableFn(el);
            if (!dataTable.changeNotifier) {
                dataTable.changeNotifier = new db.ChangeNotifier();
            }
            var f = dataTable.fields;
            var fLen = f.length;
            for (var i = 0, n = hcs.length; i < n; i++) {
                var hc = hcs[i];
                var coord = hc.getAttribute('data-hc').split(',');
                var fc = dataTable.frozenCol;
                var colS = coord[1];
                var field;
                if (fc && (typeof (fc[colS]) != 'undefined')) {
                    field = f[fc[colS]];
                } else {
                    var col = Math.min(parseInt(colS) - 1 + colOffset, fLen - 1);
                    if (dataTable.colView) {
                        field = f[dataTable.colView[col]];
                    } else {
                        field = f[col];
                    }
                }
                if (field.renderer) {
                    if (typeof (field.renderer) == 'string') {
                        field.renderer = eval(field.renderer);
                    }
                }

                hc.innerHTML = field.header ? field.header : field.name;
            }
        }
        b.refreshHeaderTemplateWithRectCoords = refreshHeaderTemplateWithRectCoords;

        function refreshBodyTemplateWithRectCoords(el, rowOffsetFld, fillGridOptions) {
            var fgo = fillGridOptions;
            var rowOffsetFld2;
            if (rowOffsetFld) {
                rowOffsetFld2 = rowOffsetFld;
            } else {
                rowOffsetFld2 = document.querySelectorAll('.' + el.id + '_rowOffset')[0];
            }

            //var rowOffsetFld2 = rowOffsetFld ? rowOffsetFld : <HTMLInputElement> document.getElementById(el.id + '_rowOffset');
            var rowOffset = (rowOffsetFld2 && rowOffsetFld2.value.length > 0) ? parseInt(rowOffsetFld2.value) : 0;
            var colOffset = (fgo && fgo.horizontalOffsetFld && fgo.horizontalOffsetFld.value.length > 0) ? parseInt(fgo.horizontalOffsetFld.value) : 0;
            var rcs = el.querySelectorAll('*[data-rc]');
            var rule = fgo ? fgo : db.data(el).populateRule;
            var dataTable = rule.dataTableFn(el);
            var dt = dataTable.data;
            var f = dataTable.fields;
            var view = dataTable.rowView;
            var frozCols = dataTable.frozenCol;
            var tnIdx = -1;
            switch (rule.treeColumn) {
                case 2 /* triState */:
                case 1 /* simple */:
                    tnIdx = db.data(el).treeNodeIndex;
                    break;
            }
            var fLen = f.length;
            var dtLen = dt.length;
            for (var i = 0, n = rcs.length; i < n; i++) {
                var rc = rcs[i];
                var coord = rc.getAttribute('data-rc').split(',');
                var colS = coord[1];
                var row = parseInt(coord[0]) - 1 + rowOffset;
                var col = Math.min(parseInt(coord[1]) - 1 + colOffset, fLen - 1);
                var dRow;
                if (view) {
                    row = (row < view.length) ? view[row] : -1;
                }
                if (row < 0) {
                    dRow = null;
                } else {
                    dRow = row < dtLen ? dt[row] : null;
                }
                var val;
                if (dRow == null) {
                    val = '&nbsp;';
                } else if (tnIdx == col) {
                    val = TreeGridColumnRenderer(dRow[col], fgo, dataTable);
                } else {
                    if (frozCols && (typeof (frozCols[colS]) != 'undefined')) {
                        val = dRow[frozCols[colS]];
                    } else {
                        if (dataTable.colView) {
                            val = dRow[dataTable.colView[col]];
                        } else {
                            val = dRow[col];
                        }
                    }
                }
                var fc = f[col];
                if (fc.renderer)
                    val = fc.renderer(val, rc, dRow);
                rc.innerHTML = val;
            }
        }
        b.refreshBodyTemplateWithRectCoords = refreshBodyTemplateWithRectCoords;

        function getTriStateForParentNode(node, dt, colIdx) {
            if (node[5 /* selected */] !== null)
                return node[5 /* selected */];
            if (!dt.parentToChildMapping) {
                mapParentChildRel(dt, colIdx);
            }

            var bEncountered0 = false;
            var bEncountered2 = false;

            var childIdxs = dt.parentToChildMapping[node[1 /* id */]];
            var data = dt.data;

            for (var i = 0, n = childIdxs.length; i < n; i++) {
                //#region examine child
                var idx = childIdxs[i];
                var child = data[idx];
                var childTN = child[colIdx];
                var sel = childTN[5 /* selected */];
                if (typeof (sel) == 'undefined')
                    sel = 0;
                switch (sel) {
                    case 0:
                        bEncountered0 = true;
                        if (bEncountered2)
                            return 1;
                        break;
                    case 1:
                        return 1;
                    case 2:
                        bEncountered2 = true;
                        if (bEncountered0)
                            return 1;
                        break;
                }
            }
            if (bEncountered0) {
                return bEncountered2 ? 1 : 0;
            } else {
                return 2;
            }
        }
        b.getTriStateForParentNode = getTriStateForParentNode;

        function mapParentChildRel(dt, colIdx) {
            var data = dt.data;
            var nodeToRowIdxMapping = {};
            for (var i = 0, n = data.length; i < n; i++) {
                var r = data[i];
                var t = r[colIdx];
                var id = t[1 /* id */];
                nodeToRowIdxMapping[id] = i;
            }
            dt.nodeToRowIdxMapping = nodeToRowIdxMapping;
            var parentToChildrenMapping = {};
            for (var i = 0, n = data.length; i < n; i++) {
                var r = data[i];
                var t = r[colIdx];
                var id = t[1 /* id */];
                var par = t[2 /* parentId */];
                var parRel = parentToChildrenMapping[par];
                if (!parRel) {
                    parRel = [];
                    parentToChildrenMapping[par] = parRel;
                }
                parRel.push(i);
            }
            dt.parentToChildMapping = parentToChildrenMapping;
        }
        b.mapParentChildRel = mapParentChildRel;
        function setDefaultTreeColumnOptions(options, bOverride) {
            if (bOverride || !options.emptyCss)
                options.emptyCss = 'fa-square-o';
            if (bOverride || !options.fullCss)
                options.fullCss = 'fa-check-square-o';
            if (bOverride || !options.partialCss)
                options.partialCss = 'fa-edit';
            if (bOverride || !options.selectToggleTemplate)
                options.selectToggleTemplate = '<span class="treeNodeSelector fa {checkClass}">&nbsp;</span> ';
            return options;
        }
        b.setDefaultTreeColumnOptions = setDefaultTreeColumnOptions;
        function TreeGridColumnRenderer(node, fgo, dt) {
            var sR;
            var nd4 = node[4 /* numChildren */];
            var sp = '<span style="display:inline-block;width:' + (node[3 /* level */] * 10) + 'px">&nbsp;</span>';
            var selectToggle = '';
            var tgso = fgo.treeNodeSelectOptions;
            switch (fgo.treeColumn) {
                case 2 /* triState */:
                    selectToggle = tgso.selectToggleTemplate; // '<span class="treeNodeSelector fa {checkClass}">&nbsp;</span>';
                    var checkClass;
                    switch (node[5 /* selected */]) {
                        case 2:
                            checkClass = tgso.fullCss; //'fa-check-square-o'
                            break;
                        case 1:
                            checkClass = tgso.partialCss; //'fa-edit';
                            break;
                        default:
                            checkClass = tgso.emptyCss; //'fa-square-o';
                    }
                    selectToggle = db.format(selectToggle, {
                        checkClass: checkClass
                    });
                    break;
            }

            if (nd4 > 0) {
                sR = '<span class="treeNodeToggler fa fa-plus-square-o">&nbsp;</span>';
            } else if (nd4 == 0) {
                sR = '';
            } else {
                sR = '<span class="treeNodeToggler fa fa-minus-square-o">&nbsp;</span>';
            }
            sR += selectToggle;
            return sp + sR + node[0 /* text */];
        }
        b.TreeGridColumnRenderer = TreeGridColumnRenderer;

        function fillGrid(el) {
            var fgo = db.extractDirective(el, 'fillGridOptions');
            if (fgo.treeColumn) {
                if (!fgo.treeNodeSelectOptions)
                    fgo.treeNodeSelectOptions = {};
                setDefaultTreeColumnOptions(fgo.treeNodeSelectOptions, false);
                applyTreeView(el, fgo);
                //if (tsp_cs) tsp_cs.addTreeNodeToggle(el);
            }
            refreshHeaderTemplateWithRectCoords(el, fgo);
            refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
            return fgo;
        }
        b.fillGrid = fillGrid;
    })(tsp.b || (tsp.b = {}));
    var b = tsp.b;
})(tsp || (tsp = {}));
//# sourceMappingURL=tsp_b.js.map
