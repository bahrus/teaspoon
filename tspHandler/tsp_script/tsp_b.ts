///<reference path='DBS_b.ts'/>

module tsp.b {



    export interface IPopulateRectCoordinates {
        //templateSelector: string;
        //verticalOffsetCtlSelector?: 
        getDataTable?: (el: HTMLElement) => IDataTable;
        suppressVerticalVirtualization?: boolean;
        //supportRowSelection?: boolean;
        rowSelection?: SelectionOptions;
        treeColumn?: TreeType;
        //supportToolTips?: boolean;
        titleFill?: TitleFillOptions;
    }


    export function refreshTemplateWithRectCoords(el: HTMLElement, rowOffsetFld?: HTMLInputElement, populateRule?: IPopulateRectCoordinates) {
        var rowOffsetFld2;
        if (rowOffsetFld) {
            rowOffsetFld2 = rowOffsetFld;
        } else {
            rowOffsetFld2 = document.querySelectorAll('.' + el.id + '_rowOffset')[0];
        }
        //var rowOffsetFld2 = rowOffsetFld ? rowOffsetFld : <HTMLInputElement> document.getElementById(el.id + '_rowOffset');
        var rowOffset = (rowOffsetFld2 && rowOffsetFld2.value.length > 0) ? parseInt(rowOffsetFld2.value) : 0;
        var rcs = el.querySelectorAll('*[data-rc]');
        var rule = populateRule ? populateRule : <IPopulateRectCoordinates> tsp.data(el).populateRule;
        var dataTable = rule.getDataTable(el);
        var dt = dataTable.data;
        var view = dataTable.rowView;
        var tnIdx = -1;
        switch (rule.treeColumn) {
            case TreeType.simple:
                tnIdx = <number> data(el).treeNodeIndex;
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



//    export function fillGrid(el: HTMLElement, populateRule: IPopulateRectCoordinates) {
//        getOrCreateHiddenInput(el, el.id + '_rowOffset', hiddenFld => {
//            tsp.data(el).populateRule = populateRule;
//            if (!el.getAttribute('data-populated')) {
//                switch (populateRule.treeColumn) {
//                    case TreeType.simple:
//                        applyTreeView(el, populateRule);
//                        break;
//                }
//                refreshTemplateWithRectCoords(el, hiddenFld, populateRule);
//                el.setAttribute('data-populated', 'yes');
//            }
//            if (isClientSideMode()) {
//                switch (populateRule.rowSelection) {
//                    case SelectionOptions.single:
//                        tcp.addRowSelection(el);
//                        break;
//                }
//                switch (populateRule.treeColumn) {
//                    case TreeType.simple:
//                        applyTreeView(el, populateRule);
//                        tcp.addTreeNodeToggle(el);
//                }
//                if (!populateRule.suppressVerticalVirtualization) {
//                    tcp.addVScroller(el, populateRule.getDataTable(el), hiddenFld);
//                }
//                switch (populateRule.titleFill) {
//                    case TitleFillOptions.text:
//                        tcp._when('mousemove', {
//                            selectorNodeTest: 'td',
//                            handler: function (evt) {
//                                var el = <HTMLElement> evt.srcElement;
//                                el.title = el.innerText;
//                            }
//                        });
//                        break;
//                }
//            }
//        });
//        tsp.data(el).initialized = true;


//    }
} 