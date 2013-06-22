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
}

interface ITask2 {
    title: string;
    from: number;
    to: number;
}

var grid3


$(function () {
    //#region Example 1
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

    //#region Example 2
    function formatter2(row, cell, value, columnDef, dataContext) {
        return value;
    }

    var grid2;
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

    var grid2 = new Slick.Grid("#myGrid2", data2, columns2, options2);


    //#endregion

    //#region Example 3

    function requiredFieldValidator(value) {
        if (value == null || value == undefined || !value.length) {
            return { valid: false, msg: "This is a required field" };
        } else {
            return { valid: true, msg: null };
        }
    }

    var data3: ITask1[] = [];
    var columns3 = [
        { id: "title", name: "Title", field: "title", width: 120, cssClass: "cell-title", editor: Slick.Editors.Text, validator: requiredFieldValidator },
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

    grid3 = new Slick.Grid("#myGrid3", data3, columns3, options3);
    grid3.setSelectionModel(new Slick.CellSelectionModel());

    grid3.onAddNewRow.subscribe(function (e, args) {
        var item = args.item;
        grid3.invalidateRow(data3.length);
        data3.push(item);
        grid3.updateRowCount();
        grid3.render();
    });

    //#endregion

    //#region Example 3a
    var grid3a;
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

    grid3a = new Slick.Grid<ITask2>("#myGrid3a", data3a, columns3a, options3a);
    

    grid3a.onValidationError.subscribe(function (e, args) {
        alert(args.validationResults.msg);
    });

    //#endregion
})
    
