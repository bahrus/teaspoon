///<reference path='DBS_b.ts'/>


module tsp.b {

    var db = DBS.b;

    export interface IDataTable  {
        data?: any[][];
        fields?: IDataField[];

        rowView?: number[];
        //rowDontView?: number[];

        frozenCol?: { [key: string]: number };
        colView?: number[];

        changeNotifier?: DBS.b.ChangeNotifier<IDataTable>;

        /**
         * Given node id as key, value is row index of data
         */
        nodeToRowIdxMapping?: { [key: string]: number };

        /**
         * Given parent id as key, value is list of row indexes of children in data
         */
        parentToChildMapping?: { [key: string]: number[] };
    
    }

    export interface IDataField {
        name?: string;
        isPrimaryKey?: boolean;
        isTreeNodeInfo?: boolean;
        header?: string;
        footer?: string;
        renderer?: any;
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

    export interface IFillGridOptions {
        //templateSelector: string;
        //verticalOffsetCtlSelector?: 
        
        horizontalOffsetFld?: HTMLInputElement;
        verticalOffsetFld?: HTMLInputElement;
        dataTableFn?: (el: HTMLElement) => IDataTable;
        suppressVerticalVirtualization?: boolean;
        //supportRowSelection?: boolean;
        rowSelection?: SelectionOptions;
        columnRemove?: IActOptions;
        columnLock?: IActOptions;
        columnMoveLeft?: IActOptions;
        columnMoveRight?: IActOptions;
        treeColumn?: TreeType;
        treeNodeSelectOptions?: ISelectNodeOptions;
        //supportToolTips?: boolean;
        titleFill?: TitleFillOptions;
    }

    export interface ISelectNodeOptions {
        selectToggleTemplate?: string;
        fullCss?: string;
        partialCss?: string;
        emptyCss?: string;
        indentTemplate?: string;
    }

    export interface ICascadingHandler {
        selectorNodeTest?: string;
        selectorNodeVoidTest?: string;
        handler: (evt: Event, cascadingHandlerInfo: ICascadingHandler) => void;
        //test?: (el: HTMLElement) => boolean;
        containerID?: string;
        container?: HTMLElement;
        data?: any;
        timeStamp?: number;
        
    }

    export interface IActOptions {
        selector: string;
        handler: (evt: Event, cascadeInfo: ICascadingHandler) => void;
        formTargets: any;
    }

    //export interface IColumnRemoveOptions {
    //    selector: string;
    //    removeHandler: (evt: Event, cascadeInfo: ICascadingHandler) => void;
    //    formTargets: any;
    //}

    export interface IScrollOptions {
        direction: DirectionOptions;
        maxValue: number;
        maxElementSize?: number;
        maxValueFn?: () => number;
        formTargets: any;
        currentValue?: number;
        maxValueChangeNotifier?: DBS.b.ChangeNotifier<IScrollOptions>;
        elementID?: string;
    }

    export interface IDisplayOnHoverOptions {
        hotspotSelector?: string;
        targetID?: string;
    }

    export enum TreeType {
        none,
        simple,
        triState,
    }

    export enum DirectionOptions {
        Vertical,
        Horizontal
    }

    export enum nodeIdxes {
        text = 0,
        id = 1,
        parentId = 2,
        level = 3,
        numChildren = 4,
        selected = 5
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

    export function applyTreeView(templEl: HTMLElement, populateRule: IFillGridOptions) {
        var dt = populateRule.dataTableFn(templEl);
        var expanded = {};
        var treeFldIdx = getNodeFldIdx(dt);
        if (treeFldIdx == -1) {
            populateRule.treeColumn = TreeType.none;
            return;
        }
        db.data(templEl).treeNodeIndex = treeFldIdx;
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
            if (!parentID || expanded[parentID]) {
                view.push(i);
            } else {
                dontView.push(i);
            }
        }
        dt.rowView = view;
        //dt.rowDontView = dontView;
        var vSlider = db.data(templEl).slider;
        if (vSlider) vSlider.slider('option', 'max', view.length);
        if (dt.changeNotifier) dt.changeNotifier.notifyListeners(dt);
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
                    var inpFld2 = <HTMLInputElement> inpFlds[j];
                    callBack(inpFld2);
                }
            }


        }
    }

    export function refreshHeaderTemplateWithRectCoords(el: HTMLElement, fillGridOptions?: IFillGridOptions) {
        var fgo = fillGridOptions;
        var colOffset = (fgo && fgo.horizontalOffsetFld && fgo.horizontalOffsetFld.value.length > 0) ? parseInt(fgo.horizontalOffsetFld.value) : 0;
        var hcs = el.querySelectorAll('*[data-hc]');
        var dataTable = fgo.dataTableFn(el);
        if (!dataTable.changeNotifier) {
            dataTable.changeNotifier = new db.ChangeNotifier<IDataTable>();
        }
        var f = dataTable.fields;
        var fLen = f.length;
        for (var i = 0, n = hcs.length; i < n; i++) {
            var hc = <HTMLElement> hcs[i];
            var coord = hc.getAttribute('data-hc').split(',');
            var fc = dataTable.frozenCol;
            var colS = coord[1];
            var field;
            if (fc && (typeof(fc[colS]) != 'undefined')) {
                field = f[fc[colS]];
            }else{
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


    export function refreshBodyTemplateWithRectCoords(el: HTMLElement, rowOffsetFld?: HTMLInputElement, fillGridOptions?: IFillGridOptions) {
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
        var rule = fgo ? fgo : <IFillGridOptions> db.data(el).populateRule;
        var dataTable = rule.dataTableFn(el);
        var dt = dataTable.data;
        var f = dataTable.fields;
        var view = dataTable.rowView;
        var frozCols = dataTable.frozenCol;
        var tnIdx = -1;
        switch (rule.treeColumn) {
            case TreeType.triState:
            case TreeType.simple:
                tnIdx = <number> db.data(el).treeNodeIndex;
                break;
        }
        var fLen = f.length;
        var dtLen = dt.length;
        for (var i = 0, n = rcs.length; i < n; i++) {
            var rc = <HTMLElement> rcs[i];
            var coord = rc.getAttribute('data-rc').split(',');
            var colS = coord[1];
            var row = parseInt(coord[0]) - 1 + rowOffset;
            var col = Math.min( parseInt(coord[1]) - 1 + colOffset, fLen - 1);
            var dRow;
            if (view) {
                row = (row < view.length) ? view[row] : -1
                console.log('row = ' + row);
                if (row == -1) {
                    debugger;
                }
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
            var fc  = f[col];
            if (fc.renderer) val = fc.renderer(val, rc, dRow);
            rc.innerHTML = val;
        }
    }

    export function getTriStateForParentNode(node: any[], dt: IDataTable, colIdx: number): number {
        if (node[nodeIdxes.selected] !== null) return node[nodeIdxes.selected];
        if (!dt.parentToChildMapping) {
            mapParentChildRel(dt, colIdx);
        }

        var bEncountered0 = false;
        var bEncountered2 = false;

        var childIdxs = dt.parentToChildMapping[node[nodeIdxes.id]];
        var data = dt.data;

        for (var i = 0, n = childIdxs.length; i < n; i++) {
            //#region examine child
            var idx = childIdxs[i];
            var child = data[idx];
            var childTN = child[colIdx];
            var sel = childTN[nodeIdxes.selected];
            if (typeof (sel) == 'undefined') sel = 0;
            switch (sel) {
                case 0:
                    bEncountered0 = true;
                    if (bEncountered2) return 1;
                    break;
                case 1:
                    return 1;
                case 2:
                    bEncountered2 = true;
                    if (bEncountered0) return 1;
                    break;
            }
        }
        if (bEncountered0) {
            return bEncountered2 ? 1 : 0;
        } else {
            return 2;
        }
    }

    export function mapParentChildRel(dt: IDataTable, colIdx: number) {
        var data = dt.data;
        var nodeToRowIdxMapping: { [key: string]: number } = {};
        for (var i = 0, n = data.length; i < n; i++) {
            var r = data[i];
            var t = r[colIdx];
            var id = t[nodeIdxes.id];
            nodeToRowIdxMapping[id] = i;
        }
        dt.nodeToRowIdxMapping = nodeToRowIdxMapping;
        var parentToChildrenMapping: { [key: string]: number[] } = {};
        for (var i = 0, n = data.length; i < n; i++) {
            var r = data[i];
            var t = r[colIdx];
            var id = t[nodeIdxes.id];
            var par = t[nodeIdxes.parentId];
            var parRel = parentToChildrenMapping[par];
            if (!parRel) {
                parRel = [];
                parentToChildrenMapping[par] = parRel;
            }
            parRel.push(i);
            
        }
        dt.parentToChildMapping = parentToChildrenMapping;
    }
    export function setDefaultTreeColumnOptions(options: ISelectNodeOptions, bOverride: boolean) : ISelectNodeOptions {
        if (bOverride || !options.emptyCss) options.emptyCss = 'fa-square-o';
        if (bOverride || !options.fullCss) options.fullCss = 'fa-check-square-o';
        if (bOverride || !options.partialCss) options.partialCss = 'fa-check-square';
        if (bOverride || !options.selectToggleTemplate) options.selectToggleTemplate = '<span class="treeNodeSelector fa {checkClass}">&nbsp;</span> ';
        if (bOverride || !options.indentTemplate) options.indentTemplate = '<span class="treeNodeIndent fa fa-ellipsis-h">&nbsp;</span>';
        return options;
    }
    export function TreeGridColumnRenderer(node: any[], fgo: IFillGridOptions, dt: IDataTable): string {
        var sR;
        var nd4 = node[nodeIdxes.numChildren];
        var tgso = fgo.treeNodeSelectOptions;
        var sp = '';
        for (var i = 0, n = node[nodeIdxes.level]; i < n; i++){
            sp += tgso.indentTemplate;
        }
        //var sp = '<span style="display:inline-block;width:' + (node[nodeIdxes.level] * 10) + 'px">&nbsp;</span>';
        var selectToggle = '';
        
        switch (fgo.treeColumn) {
            case TreeType.triState:
                selectToggle = tgso.selectToggleTemplate; // '<span class="treeNodeSelector fa {checkClass}">&nbsp;</span>';
                var checkClass;
                switch (node[nodeIdxes.selected]) {
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
        return sp + sR + node[nodeIdxes.text];
    }

    export function fillGrid(el: HTMLElement) : IFillGridOptions {
        var fgo = <IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
        if (fgo.treeColumn) {
            if (!fgo.treeNodeSelectOptions) fgo.treeNodeSelectOptions = {};
            setDefaultTreeColumnOptions(fgo.treeNodeSelectOptions, false);
            applyTreeView(el, fgo);
            //if (tsp_cs) tsp_cs.addTreeNodeToggle(el);
        }
        refreshHeaderTemplateWithRectCoords(el, fgo);
        refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        return fgo;
        
    }

    

    



} 