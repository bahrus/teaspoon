﻿///<reference path='DBS_b.ts'/>


module tsp.b {

    var db = DBS.b;

    export interface IDataTable extends DBS.b.INotifyListeners {
        data?: any[][];
        fields?: IDataField[];

        rowView?: number[];
        //rowDontView?: number[];

        colView?: number[];
    
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
        getDataTable?: (el: HTMLElement) => IDataTable;
        suppressVerticalVirtualization?: boolean;
        //supportRowSelection?: boolean;
        rowSelection?: SelectionOptions;
        treeColumn?: TreeType;
        //supportToolTips?: boolean;
        titleFill?: TitleFillOptions;
    }

    export interface IScrollOptions {
        direction: DirectionOptions;
        maxValue: number;
        maxElementSize?: number;
        maxValueFn?: () => number;
        formTargets: any;
        currentValue?: number;
        maxValueChangeNotifier?: DBS.b.INotifyListeners;
        elementID?: string;
    }

    export interface IDisplayOnHoverOptions {
        hotspotSelector?: string;
        targetID?: string;
    }

    export enum TreeType {
        none,
        simple,
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
        var dt = populateRule.getDataTable(templEl);
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
        console.log('tsp.n.applyTreeView.notifyListeners');
        db.notifyListeners(dt);
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

    export function refreshHeaderTemplateWithRectCoords(el: HTMLElement, fillGridOptions?: IFillGridOptions) {
        var fgo = fillGridOptions;
        var colOffset = (fgo && fgo.horizontalOffsetFld && fgo.horizontalOffsetFld.value.length > 0) ? parseInt(fgo.horizontalOffsetFld.value) : 0;
        var hcs = el.querySelectorAll('th[data-hc]');
        var dataTable = fgo.getDataTable(el);
        var fields = dataTable.fields;
        for (var i = 0, n = hcs.length; i < n; i++) {
            var fldIdx = Math.min(fields.length - 1, i + colOffset);
            var field;
            if (dataTable.colView) {
                field = fields[dataTable.colView[fldIdx]];
            } else {
                field = fields[fldIdx];
            }
            if (field.renderer) {
                if (typeof (field.renderer) == 'string') {
                    field.renderer = eval(field.renderer);
                }
            }
            //var hc;
            //if (dataTable.colView) {
            //    hc = <HTMLTableCellElement> hcs[dataTable.colView[i]];
            //} else {
            //    hc = <HTMLTableCellElement> hcs[i];
            //}
            //if(hc) 
            var hc = <HTMLTableCellElement> hcs[i];
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
        var dataTable = rule.getDataTable(el);
        var dt = dataTable.data;
        var f = dataTable.fields;
        var view = dataTable.rowView;
        var tnIdx = -1;
        switch (rule.treeColumn) {
            case TreeType.simple:
                tnIdx = <number> db.data(el).treeNodeIndex;
                break;
        }
        for (var i = 0, n = rcs.length; i < n; i++) {
            var rc = <HTMLElement> rcs[i];
            var coord = rc.getAttribute('data-rc').split(',');
            var row = parseInt(coord[0]) - 1 + rowOffset;
            var col = Math.min( parseInt(coord[1]) - 1 + colOffset, f.length - 1);
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
                if (dataTable.colView) {
                    val = dRow[dataTable.colView[col]];
                } else {
                    val = dRow[col];
                }
            }
            var fc  = f[col];
            if (fc.renderer) val = fc.renderer(val, rc, dRow);
            rc.innerHTML = val;
        }
    }

    export function TreeGridColumnRenderer(node: any[]): string {
        var sR;
        //var nd4 = node[4];
        var nd4 = node[nodeIdxes.numChildren];
        var sp = '<span style="display:inline-block;width:' + (node[nodeIdxes.level] * 10) + 'px">&nbsp;</span>';
        if (nd4 > 0) {
            //sR = '<span class="dynatree-expander treeNodeToggler">&nbsp;</span>';
            sR = '<span class="treeNodeToggler fa fa-plus-square-o">&nbsp;</span>';
        } else if (nd4 == 0) {
            sR = '';
        } else {
            sR = '<span class="treeNodeToggler fa fa-minus-square-o">&nbsp;</span>';
        }
        return sp + sR + node[nodeIdxes.text];
    }

    export function fillGrid(el: HTMLElement) : IFillGridOptions {
        var fgo = <IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
        if (fgo.treeColumn) {
            applyTreeView(el, fgo);
            //if (tsp_cs) tsp_cs.addTreeNodeToggle(el);
        }
        refreshHeaderTemplateWithRectCoords(el, fgo);
        refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        return fgo;
        
    }

    

    



} 