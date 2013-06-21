///<reference path="jquery.d.ts"/>
///<reference path="slickgrid.d.ts"/>


interface ITask1{
    title: string;
    duration: string;
    percentComplete: number;
    start: string;
    finish: string;
    effortDriven: boolean;
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

    var data1 : ITask1[] = [];
    for(var i = 0; i < 500; i++) {
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
    var data2 : ITask1[] = [];
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

    var data3 : ITask1[] = [];
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

            title : "Task " + i,
            description : "This is a sample task description.\n  It can be multiline",
            duration : "5 days",
            percentComplete: Math.round(Math.random() * 100),
            start: "01/01/2009",
            finish: "01/05/2009",
            effortDriven : (i % 5 == 0),
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
})
    
