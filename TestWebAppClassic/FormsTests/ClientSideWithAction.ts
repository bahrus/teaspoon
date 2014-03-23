///<reference path="../../tspHandler/tsp_script/DBS.ts"/>
///<reference path="../Scripts/typings/slickgrid/SlickGrid.d.ts"/>

module FormsTests.ClientSideWithAction {

    export function attachRenderer(targetElement: HTMLElement) {
        var te = <DBS.IRender> targetElement;
        te.render = renderSlickGrid;
    }

    export function renderSlickGrid(targetElement: HTMLElement, data: any) {
        var sPrimaryKey;
        for (var sKey in data) {
            sPrimaryKey = sKey;
            break;
        }
        var firstRow = data[sPrimaryKey][0]; //TODO:  could throw error
        var slCols: Slick.Column<any>[] = [];
        for (var col in firstRow) {
            var slCol: Slick.Column<any> = {
                id: col,
                name: col,
                field: col,
                header: col,
            };
            slCols.push(slCol);
        }
        var options: Slick.GridOptions<any> = {
            enableCellNavigation: true,
            enableColumnReorder: false,
        };
        var grid = new Slick.Grid<Slick.SlickData>(targetElement, data[sPrimaryKey], slCols, options);
        return targetElement;

    }
}