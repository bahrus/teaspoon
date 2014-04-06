///<reference path='DBS_b.ts'/>

module tsp.b {

    var db = DBS.b;

    export interface IDataTable {
        data?: any[][];
        fields?: IDataField[];

        rowView?: number[];
        rowDontView?: number[];
    }

    export interface IDataField {
        name?: string;
        isPrimaryKey?: boolean;
        isTreeNodeInfo?: boolean;
        header?: string;
        footer?: string;
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
        maxElementSize: number;
        formTargets: any;
        currentValue?: number;
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




    export function refreshTemplateWithRectCoords(el: HTMLElement, rowOffsetFld?: HTMLInputElement, populateRule?: IFillGridOptions) {
        var rowOffsetFld2;
        if (rowOffsetFld) {
            rowOffsetFld2 = rowOffsetFld;
        } else {
            rowOffsetFld2 = document.querySelectorAll('.' + el.id + '_rowOffset')[0];
        }
        //var rowOffsetFld2 = rowOffsetFld ? rowOffsetFld : <HTMLInputElement> document.getElementById(el.id + '_rowOffset');
        var rowOffset = (rowOffsetFld2 && rowOffsetFld2.value.length > 0) ? parseInt(rowOffsetFld2.value) : 0;
        var rcs = el.querySelectorAll('*[data-rc]');
        var rule = populateRule ? populateRule : <IFillGridOptions> db.data(el).populateRule;
        var dataTable = rule.getDataTable(el);
        var dt = dataTable.data;
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

    export function TreeGridColumnRenderer(node: any[]): string {
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

    export function fillGrid(el: HTMLElement) {
        var fgo = <IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
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
            refreshTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }

    

    function verticalOffsetChangeHandler(verticalOffsetFld: HTMLElement) {
        var dgs = <HTMLElement[]> db.data(verticalOffsetFld).dependantGrids;
        for (var i = 0, n = dgs.length; i < n; i++) {
            var el = dgs[i];
            var fgo = <IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
            refreshTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }



} 