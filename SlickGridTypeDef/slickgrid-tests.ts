///<reference path="jquery.d.ts"/>
///<reference path="jqueryui.d.ts"/>
///<reference path="slickgrid.d.ts"/>


interface ITask1 {
    title: string;
    duration: string;
    percentComplete: number;
    start: string;
    finish: string;
    effortDriven: boolean;
    id?: string;
}

interface ITask2 {
    title: string;
    from: number;
    to: number;
}

var grid3


$(function () {
    //#region Example 1 Simple
    var options1: Slick.GridOptions = {
        enableCellNavigation: true,
        enableColumnReorder: false
    };

    var columns1: Slick.ColumnOption[] = [
        { id: "title", name: "Title", field: "title" },
        { id: "duration", name: "Duration", field: "duration" },
        { id: "%", name: "% Complete", field: "percentComplete" },
        { id: "start", name: "Start", field: "start" },
        { id: "finish", name: "Finish", field: "finish" },
        { id: "effort-driven", name: "Effort Driven", field: "effortDriven" },

    ];

    var data1: ITask1[] = [];
    for (var i = 0; i < 500; i++) {
        data1[i] = {
            title: "Task " + i,
            duration: "5 days",
            percentComplete: Math.round(Math.random() * 100),
            start: "01/01/2009",
            finish: "01/05/2009",
            effortDriven: (i % 5 == 0),
        };
    }
    
    var grid1 = new Slick.Grid<ITask1>("#myGrid1", data1, columns1, options1);
    
    //#endregion

    //#region Example 2 Formatters
    function formatter2(row, cell, value, columnDef, dataContext) {
        return value;
    }

    var data2: ITask1[] = [];
    var columns2 = [
        { id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title", formatter: formatter2 },
        { id: "duration", name: "Duration", field: "duration" },
        { id: "%", name: "% Complete", field: "percentComplete", width: 80, resizable: false, formatter: Slick.Formatters.PercentCompleteBar },
        { id: "start", name: "Start", field: "start", minWidth: 60 },
        { id: "finish", name: "Finish", field: "finish", minWidth: 60 },
        { id: "effort-driven", name: "Effort Driven", sortable: false, width: 80, minWidth: 20, maxWidth: 80, cssClass: "cell-effort-driven", field: "effortDriven", formatter: Slick.Formatters.Checkmark }
    ];

    var options2 = {
        editable: false,
        enableAddRow: false,
        enableCellNavigation: true
    };

    for (var i = 0; i < 5; i++) {
        data2[i] = {

            title: "<a href='#' tabindex='0'>Task</a> " + i,
            duration: "5 days",
            percentComplete: Math.min(100, Math.round(Math.random() * 110)),
            start: "01/01/2009",
            finish: "01/05/2009",
            effortDriven: (i % 5 == 0),
        }
    }

    var grid2 = new Slick.Grid<ITask1>("#myGrid2", data2, columns2, options2);


    //#endregion

    //#region Example 3 Editing

    function requiredFieldValidator3(value) {
        if (value == null || value == undefined || !value.length) {
            return { valid: false, msg: "This is a required field" };
        } else {
            return { valid: true, msg: null };
        }
    }

    var data3: ITask1[] = [];
    var columns3 = [
        { id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title", editor: Slick.Editors.Text, validator: requiredFieldValidator3 },
        { id: "desc", name: "Description", field: "description", width: 100, editor: Slick.Editors.LongText },
        { id: "duration", name: "Duration", field: "duration", editor: Slick.Editors.Text },
        { id: "%", name: "% Complete", field: "percentComplete", width: 80, resizable: false, formatter: Slick.Formatters.PercentCompleteBar, editor: Slick.Editors.PercentComplete },
        { id: "start", name: "Start", field: "start", minWidth: 60, editor: Slick.Editors.Date },
        { id: "finish", name: "Finish", field: "finish", minWidth: 60, editor: Slick.Editors.Date },
        { id: "effort-driven", name: "Effort Driven", width: 80, minWidth: 20, maxWidth: 80, cssClass: "cell-effort-driven", field: "effortDriven", formatter: Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox }
    ];
    var options3 = {
        editable: true,
        enableAddRow: true,
        enableCellNavigation: true,
        asyncEditorLoading: false,
        autoEdit: false
    };

    for (var i = 0; i < 500; i++) {
        data3[i] = {

            title: "Task " + i,
            description: "This is a sample task description.\n  It can be multiline",
            duration: "5 days",
            percentComplete: Math.round(Math.random() * 100),
            start: "01/01/2009",
            finish: "01/05/2009",
            effortDriven: (i % 5 == 0),
        }
    }

    var grid3 = new Slick.Grid<ITask1>("#myGrid3", data3, columns3, options3);
    grid3.setSelectionModel(new Slick.CellSelectionModel());

    grid3.onAddNewRow.subscribe(function (e, args : Slick.eventArgs<ITask1>) {
        var item = args.item;
        grid3.invalidateRow(data3.length);
        data3.push(item);
        grid3.updateRowCount();
        grid3.render();
    });

    //#endregion

    //#region Example 3a Compound Editor
    var data3a: ITask2[] = [];
    var columns3a = [
        { id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title", editor: Slick.Editors.Text },
        { id: "range", name: "Range", width: 120, formatter: NumericRangeFormatter3a, editor: NumericRangeEditor3a }
    ];

    var options3a = {
        editable: true,
        enableAddRow: false,
        enableCellNavigation: true,
        asyncEditorLoading: false,
    };

    function NumericRangeFormatter3a(row, cell, value, columnDef, dataContext) {
        return dataContext.from + " - " + dataContext.to;
    }

    function NumericRangeEditor3a(args) {
        var $from, $to;
        var scope = this;

        this.init = function () {
            $from = $("<INPUT type=text style='width:40px' />")
                .appendTo(args.container)
                .bind("keydown", scope.handleKeyDown);

            $(args.container).append("&nbsp; to &nbsp;");

            $to = $("<INPUT type=text style='width:40px' />")
                .appendTo(args.container)
                .bind("keydown", scope.handleKeyDown);

            scope.focus();
        };

        this.handleKeyDown = function (e) {
            if (e.keyCode == $.ui.keyCode.LEFT || e.keyCode == $.ui.keyCode.RIGHT || e.keyCode == $.ui.keyCode.TAB) {
                e.stopImmediatePropagation();
            }
        };

        this.destroy = function () {
            $(args.container).empty();
        };

        this.focus = function () {
            $from.focus();
        };

        this.serializeValue = function () {
            return { from: parseInt($from.val(), 10), to: parseInt($to.val(), 10) };
        };

        this.applyValue = function (item, state) {
            item.from = state.from;
            item.to = state.to;
        };

        this.loadValue = function (item) {
            $from.val(item.from);
            $to.val(item.to);
        };

        this.isValueChanged = function () {
            return args.item.from != parseInt($from.val(), 10) || args.item.to != parseInt($from.val(), 10);
        };

        this.validate = function () {
            if (isNaN(parseInt($from.val(), 10)) || isNaN(parseInt($to.val(), 10))) {
                return { valid: false, msg: "Please type in valid numbers." };
            }

            if (parseInt($from.val(), 10) > parseInt($to.val(), 10)) {
                return { valid: false, msg: "'from' cannot be greater than 'to'" };
            }

            return { valid: true, msg: null };
        };

        this.init();
    }

    for (var i = 0; i < 500; i++) {
        var from = Math.round(Math.random() * 100);
        data3a[i] = {

            title: "Task " + i,
            from: from,
            to: from + Math.round(Math.random() * 100),
        }
    }

    var grid3a = new Slick.Grid<ITask2>("#myGrid3a", data3a, columns3a, options3a);
    

    grid3a.onValidationError.subscribe(function (e: Event, args : Slick.eventArgs<ITask2>) {
        alert(args.validationResults.msg);
    });

    //#endregion

    //#region Example 3b Editing With Undo
    function requiredFieldValidator3b(value) {
        if (value == null || value == undefined || !value.length) {
            return { valid: false, msg: "This is a required field" };
        } else {
            return { valid: true, msg: null };
        }
    }

    var data3b: ITask1[] = [];

    var columns3b : Slick.ColumnOption[] = [
        { id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title", editor: Slick.Editors.Text, validator: requiredFieldValidator3b },
        { id: "desc", name: "Description", field: "description", width: 100, editor: Slick.Editors.LongText },
        { id: "duration", name: "Duration", field: "duration", editor: Slick.Editors.Text },
        { id: "%", name: "% Complete", field: "percentComplete", width: 80, resizable: false, formatter: Slick.Formatters.PercentCompleteBar, editor: Slick.Editors.PercentComplete },
        { id: "start", name: "Start", field: "start", minWidth: 60, editor: Slick.Editors.Date },
        { id: "finish", name: "Finish", field: "finish", minWidth: 60, editor: Slick.Editors.Date },
        { id: "effort-driven", name: "Effort Driven", width: 80, minWidth: 20, maxWidth: 80, cssClass: "cell-effort-driven", field: "effortDriven", formatter: Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox }
    ];

    var options3b : Slick.GridOptions = {
        editable: true,
        enableAddRow: false,
        enableCellNavigation: true,
        asyncEditorLoading: false,
        autoEdit: false,
        editCommandHandler: queueAndExecuteCommand3b
    };

    var commandQueue3b = [];

    function queueAndExecuteCommand3b(item, column, editCommand) {
        commandQueue3b.push(editCommand);
        editCommand.execute();
    }

    function undo3b() {
        var command = commandQueue3b.pop();
        
        if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
            command.undo();
            grid3b.gotoCell(command.row, command.cell, false);
        }
    }

    for (var i = 0; i < 500; i++) {
        data3b[i] = {

            title: "Task " + i,
            description: "This is a sample task description.\n  It can be multiline",
            duration: "5 days",
            percentComplete: Math.round(Math.random() * 100),
            start: "01/01/2009",
            finish: "01/05/2009",
            effortDriven: (i % 5 == 0),
        }
    }

    var grid3b = new Slick.Grid<ITask1>("#myGrid3b", data3b, columns3b, options3b);

    //#endregion

    //#region Example 4 Model
    var grid4;
    var data4 : ITask1[] = [];
    var columns4 = [
        { id: "sel", name: "#", field: "num", behavior: "select", cssClass: "cell-selection", width: 40, cannotTriggerInsert: true, resizable: false, selectable: false },
        { id: "title", name: "Title", field: "title", width: 120, minWidth: 120, cssClass: "cell-title", editor: Slick.Editors.Text, validator: requiredFieldValidator4, sortable: true },
        { id: "duration", name: "Duration", field: "duration", editor: Slick.Editors.Text, sortable: true },
        { id: "%", defaultSortAsc: false, name: "% Complete", field: "percentComplete", width: 80, resizable: false, formatter: Slick.Formatters.PercentCompleteBar, editor: Slick.Editors.PercentComplete, sortable: true },
        { id: "start", name: "Start", field: "start", minWidth: 60, editor: Slick.Editors.Date, sortable: true },
        { id: "finish", name: "Finish", field: "finish", minWidth: 60, editor: Slick.Editors.Date, sortable: true },
        { id: "effort-driven", name: "Effort Driven", width: 80, minWidth: 20, maxWidth: 80, cssClass: "cell-effort-driven", field: "effortDriven", formatter: Slick.Formatters.Checkmark, editor: Slick.Editors.Checkbox, cannotTriggerInsert: true, sortable: true }
    ];

    var options4 = {
        editable: true,
        enableAddRow: true,
        enableCellNavigation: true,
        asyncEditorLoading: true,
        forceFitColumns: false,
        topPanelHeight: 25
    };

    var sortcol4 = "title";
    var sortdir4 = 1;
    var percentCompleteThreshold4 = 0;
    var searchString4 = "";

    function requiredFieldValidator4(value) {
        if (value == null || value == undefined || !value.length) {
            return { valid: false, msg: "This is a required field" };
        }
        else {
            return { valid: true, msg: null };
        }
    }

    function myFilter4(item, args) {
        if (item["percentComplete"] < args.percentCompleteThreshold) {
            return false;
        }

        if (args.searchString != "" && item["title"].indexOf(args.searchString) == -1) {
            return false;
        }

        return true;
    }

    function percentCompleteSort4(a, b) {
        return a["percentComplete"] - b["percentComplete"];
    }

    function comparer4(a, b) {
        var x = a[sortcol4], y = b[sortcol4];
        return (x == y ? 0 : (x > y ? 1 : -1));
    }

    function toggleFilterRow() {
        grid4.setTopPanelVisibility(!grid4.getOptions().showTopPanel);
    }


    $(".grid-header .ui-icon")
        .addClass("ui-state-default ui-corner-all")
        .mouseover(function (e) {
            $(e.target).addClass("ui-state-hover")
        })
        .mouseout(function (e) {
            $(e.target).removeClass("ui-state-hover")
        });

        // prepare the data
        for (var i = 0; i < 50000; i++) {
            data4[i] = {

                id: "id_" + i,
                num: i,
                title: "Task " + i,
                duration: "5 days",
                percentComplete: Math.round(Math.random() * 100),
                start: "01/01/2009",
                finish: "01/05/2009",
                effortDriven: (i % 5 == 0),
            }
        }


        var dataView4 = new Slick.Data.DataView<ITask1>({ inlineFilters: true });
        grid4 = new Slick.Grid<ITask1>("#myGrid", dataView4, columns4, options4);
        
        grid4.setSelectionModel(new Slick.RowSelectionModel());

        var pager4 = new Slick.Controls.Pager(dataView4, grid4, $("#pager"));
        var columnpicker4 = new Slick.Controls.ColumnPicker(columns4, grid4, options4);


        // move the filter panel defined in a hidden div into grid top panel
        $("#inlineFilterPanel")
            .appendTo(grid4.getTopPanel())
            .show();

        grid4.onCellChange.subscribe(function (e, args) {
            dataView4.updateItem(args.item.id, args.item);
        });

        grid4.onAddNewRow.subscribe(function (e, args) {
            var item : ITask1 = { "num": data4.length, "id": "new_" + (Math.round(Math.random() * 10000)), "title": "New task", "duration": "1 day", "percentComplete": 0, "start": "01/01/2009", "finish": "01/01/2009", "effortDriven": false };
            $.extend(item, args.item);
            dataView4.addItem(item);
        });

        grid4.onKeyDown.subscribe(function (e) {
            // select all rows on ctrl-a
            if (e.which != 65 || !e.ctrlKey) {
                return false;
            }

            var rows = [];
            for (var i = 0; i < dataView4.getLength(); i++) {
                rows.push(i);
            }

            grid4.setSelectedRows(rows);
            e.preventDefault();
        });

        grid4.onSort.subscribe(function (e, args) {
            sortdir4 = args.sortAsc ? 1 : -1;
            sortcol4 = args.sortCol.field;

            //if ($.browser.msie && $.browser.version <= 8) {
            //    // using temporary Object.prototype.toString override
            //    // more limited and does lexicographic sort only by default, but can be much faster

            //    var percentCompleteValueFn = function () {
            //        var val = this["percentComplete"];
            //        if (val < 10) {
            //            return "00" + val;
            //        } else if (val < 100) {
            //            return "0" + val;
            //        } else {
            //            return val;
            //        }
            //    };

            //    // use numeric sort of % and lexicographic for everything else
            //    dataView4.fastSort((sortcol == "percentComplete") ? percentCompleteValueFn : sortcol, args.sortAsc);
            //} else {
                // using native sort with comparer
                // preferred method but can be very slow in IE with huge datasets
                dataView4.sort(comparer4, args.sortAsc);
            //}
        });

        // wire up model events to drive the grid
        dataView4.onRowCountChanged.subscribe(function (e, args) {
            grid4.updateRowCount();
            grid4.render();
        });

        dataView4.onRowsChanged.subscribe(function (e, args : Slick.eventArgs<ITask1>) {
            grid4.invalidateRows(args.rows);
            grid4.render();
        });

        dataView4.onPagingInfoChanged.subscribe(function (e, pagingInfo: Slick.eventArgs<ITask1>) {
            var isLastPage = pagingInfo.pageNum == pagingInfo.totalPages - 1;
            var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
            var options = grid4.getOptions();

            if (options.enableAddRow != enableAddRow) {
                grid4.setOptions({ enableAddRow: enableAddRow });
            }
        });


        var h_runfilters = null;

        // wire up the slider to apply the filter to the model
        $("#pcSlider,#pcSlider2").slider({
            "range": "min",
            "slide": function (event, ui) {
                Slick.GlobalEditorLock.cancelCurrentEdit();

                if (percentCompleteThreshold4 != ui.value) {
                    window.clearTimeout(h_runfilters);
                    h_runfilters = window.setTimeout(updateFilter, 10);
                    percentCompleteThreshold4 = ui.value;
                }
            }
        });


        // wire up the search textbox to apply the filter to the model
        $("#txtSearch,#txtSearch2").keyup(function (e) {
            Slick.GlobalEditorLock.cancelCurrentEdit();

            // clear on Esc
            if (e.which == 27) {
                this.value = "";
            }

            searchString4 = this.value;
            updateFilter();
        });

        function updateFilter() {
            dataView4.setFilterArgs({
                percentCompleteThreshold: percentCompleteThreshold4,
                searchString: searchString4
            });
            dataView4.refresh();
        }

        $("#btnSelectRows").click(function () {
            if (!Slick.GlobalEditorLock.commitCurrentEdit()) {
                return;
            }

            var rows = [];
            for (var i = 0; i < 10 && i < dataView4.getLength(); i++) {
                rows.push(i);
            }

            grid4.setSelectedRows(rows);
        });


        // initialize the model after all the events have been hooked up
        dataView4.beginUpdate();
        dataView4.setItems(data4);
        dataView4.setFilterArgs({
            percentCompleteThreshold: percentCompleteThreshold4,
            searchString: searchString4
        });
        dataView4.setFilter(myFilter4);
        dataView4.endUpdate();

        // if you don't want the items that are not visible (due to being filtered out
        // or being on a different page) to stay selected, pass 'false' to the second arg
        dataView4.syncGridSelection(grid4, true);

        $("#gridContainer").resizable();

    //#endregion


})
    
