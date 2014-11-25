///<reference path='../tsp_script/tsp_b.ts'/>

declare var model: any;

if (typeof (model) == 'undefined') model = {};
var model_dataTable: tsp.b.IDataTable = {
    "fields": [
        {
            "name": "Column 0",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        //#region begin
        {
            "name": "Column 1",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        {
            "name": "Column 2",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        {
            "name": "Column 3",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        {
            "name": "Column 4",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        {
            "name": "Column 5",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        //#endregion
        {
            "name": "Column 6",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        {
            "name": "Column 7",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        {
            "name": "Column 8",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        },
        {
            "name": "Column 9",
            "isTreeNodeInfo": false,
            "header": null,
            "footer": null
        }
    ],
    "data": [
        [
            "Row 0, Column 0",
            "Row 0, Column 1",
            "Row 0, Column 2",
            "Row 0, Column 3",
            "Row 0, Column 4",
            "Row 0, Column 5",
            "Row 0, Column 6",
            "Row 0, Column 7",
            "Row 0, Column 8",
            "Row 0, Column 9"
        ],
        [
            "Row 1, Column 0",
            "Row 1, Column 1",
            "Row 1, Column 2",
            "Row 1, Column 3",
            "Row 1, Column 4",
            "Row 1, Column 5",
            "Row 1, Column 6",
            "Row 1, Column 7",
            "Row 1, Column 8",
            "Row 1, Column 9"
        ],
        [
            "Row 2, Column 0",
            "Row 2, Column 1",
            "Row 2, Column 2",
            "Row 2, Column 3",
            "Row 2, Column 4",
            "Row 2, Column 5",
            "Row 2, Column 6",
            "Row 2, Column 7",
            "Row 2, Column 8",
            "Row 2, Column 9"
        ],
    ]
}; 

model['dataTable'] = model_dataTable;