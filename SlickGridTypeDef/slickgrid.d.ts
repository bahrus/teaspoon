declare module Slick {
    //#region Options
    export interface ColumnOption {
        /**
        * Accepts a function of the form function(cellNode, row, dataContext, colDef) and is used to post-process the cell's DOM node / nodes
        */
        asyncPostRender?: (cellNode: any, row: any, dataContext: any, colDef: any) => void;

        /**
        * Used by the the slick.rowMoveManager.js plugin for moving rows. Has no effect without the plugin installed.
        */
        behavior?: any;

        /**
        * In the “Add New” row, determines whether clicking cells in this column can trigger row addition. If true, clicking on the cell in this column in the "Add New" row will not trigger row addition.
        */
        cannotTriggerInsert?: boolean;

        /**
        * Accepts a string as a class name, applies that class to every row cell in the column.
        */
        cssClass?: string;

        /**
        * When set to true, the first user click on the header will do a descending sort. When set to false, the first user click on the header will do an ascending sort.
        */
        defaultSortAsc?: boolean;

        /**
        * The editor for cell edits {TextEditor, IntegerEditor, DateEditor…}
        */
        editor?: any;

        /**
        * The property name in the data object to pull content from. (This is assumed to be on the root of the data object.)
        */
        field?: string;

        /**
        * When set to false, clicking on a cell in this column will not select the row for that cell. The cells in this column will also be skipped during tab navigation.
        */
        focusable?: boolean;

        /**
        * This accepts a function of the form function(row, cell, value, columnDef, dataContext) and returns a formatted version of the data in each cell of this column. For example, setting formatter to function(r, c, v, cd, dc) { return “Hello!”; } would overwrite every value in the column with “Hello!” See defaultFormatter in slick.grid.js for an example formatter.
        */
        formatter?: (row: any, cell: any, value: any, columnDef: any, dataContext: any) => any;

        /**
        * Accepts a string as a class name, applies that class to the cell for the column header.
        */
        headerCssClass?: string;
        /**
        * A unique identifier for the column within the grid.
        */
        id?: string;


        /**
        * Set the maximum allowable width of this column, in pixels.
        */
        maxWidth?: number;

        /**
        * Set the minimum allowable width of this column, in pixels.
        */
        minWidth?: number;


        /**
        *  The text to display on the column heading.
        */
        name?: string;

        /**
        * If set to true, whenever this column is resized, the entire table view will rerender.
        */
        rerenderOnResize?: boolean;

        /**
        * If false, column can no longer be resized.
        */
        resizable?: boolean;

        /**
        * If false, when a row is selected, the CSS class for selected cells (“selected” by default) is not applied to the cell in this column.
        */
        selectable?: boolean;

        /**
        *  If true, the column will be sortable by clicking on the header.
        */
        sortable?: boolean;

        /**
        * If set to a non-empty string, a tooltip will appear on hover containing the string.
        */
        toolTip?: string;

        /**
        *  Width of the column in pixels. (May often be overridden by things like minWidth, maxWidth, forceFitColumns, etc.)
        */
        width?: number;
    }

    export interface ColumnSort {
        columnId: string;
        sortAsc: boolean;
    }

    export interface CellCoordinates {
        rowIndex: number;
        colIndex: number;
    }

    export interface CellPosition {
        bottom: number;
        height: number;
        left: number;
        right: number;
        top: number;
        visible: number;
        width: number;
    }

    export interface GridOptions {
        /**
        * Makes cell editors load asynchronously after a small delay. This greatly increases keyboard navigation speed.
        */
        asyncEditorLoading?: boolean;

        /**
        * Delay after which cell editor is loaded. Ignored unless asyncEditorLoading is true.
        */
        asyncEditorLoadDelay?: number;

        /**
        * 
        */
        asyncPostRenderDelay?: number;

        /**
        * Cell will not automatically go into edit mode when selected.
        */
        autoEdit?: boolean;

        /**
        *
        */
        autoHeight?: boolean;

        /**
        * A CSS class to apply to flashing cells via flashCell().
        */
        cellFlashingCssClass?: string;

        /**
        * A CSS class to apply to cells highlighted via setHighlightedCells().
        */
        cellHighlightCssClass?: string;

        dataItemColumnValueExtractor?: any;

        defaultColumnWidth?: number;

        defaultFormatter?: any;

        editable?: boolean;

        editCommandHandler?: any;

        /**
        * A factory object responsible to creating an editor for a given cell. Must implement getEditor(column).
        */
        editorFactory?: IHasEditor;

        /**
        * A Slick.EditorLock instance to use for controlling concurrent data edits.
        */
        editorLock?: any;

        /**
        * If true, a blank row will be displayed at the bottom - typing values in that row will add a new one. Must subscribe to onAddNewRow to save values.
        */
        enableAddRow?: boolean;

        /**
        * If true, async post rendering will occur and asyncPostRender delegates on columns will be called.
        */
        enableAsyncPostRender?: boolean;


        /**
        * Appears to enable cell virtualisation for optimised speed with large datasets
        */
        enableCellNavigation?: boolean;

        /**
        * 
        */
        enableColumnReorder?: boolean;

        enableTextSelectionOnCells?: boolean;

        explicitInitialization?: boolean;

        /**
        * Force column sizes to fit into the container (preventing horizontal scrolling). Effectively sets column width to be 1/Number of Columns which on small containers may not be desirable
        */
        forceFitColumns?: boolean;

        forceSyncScrolling?: boolean;

        /**
        * A factory object responsible to creating a formatter for a given cell. Must implement getFormatter(column).
        */
        formatterFactory?: IHasFormatter;

        /**
        * Will expand the table row divs to the full width of the container, table cell divs will remain aligned to the left
        */
        fullWidthRows?: boolean;

        headerRowHeight?: number;

        leaveSpaceForNewRows?: boolean;

        multiColumnSort?: boolean;

        multiSelect?: boolean;

        rowHeight?: number;

        selectedCellCssClass?: string;

        showHeaderRow?: boolean;

        /**
        * If true, the column being resized will change its width as the mouse is dragging the resize handle. If false, the column will resize after mouse drag ends.
        */
        syncColumnCellResize?: boolean;

        topPanelHeight?: number;

    }

    export interface IHasEditor {
        getEditor: (column: any) => any;
    }

    export interface IHasFormatter {
        getFormatter: (column: any) => any;
    }
    //#endregion

    export class Grid<TItem> {
        constructor(container: any, data: TItem[], columns: ColumnOption[], options: GridOptions);


        /**
        * Initializes the grid. Called after plugins are registered. Normally, this is called by the constructor, so you don't need to call it. However, in certain cases you may need to delay the initialization until some other process has finished. In that case, set the explicitInitialization option to true and call the grid.init() manually.
        */
        init: () => void;

        getData: () => TItem[];

        getDataItem: (index: number) => TItem;

        setData: (newData, scrollToTop) => void;

        getDataLength: () => number;

        getOptions: () => GridOptions;

        getSelectedRows: () => number[];

        getSelectionModel: () => any;

        setOptions: (options: GridOptions) => void;

        setSelectedRows: (rowsArray: number[]) => void;

        setSelectionModel: (selectionModel: any) => void;

        autosizeColumns: () => void;

        getColumnIndex: (id: string) => number;

        getColumns: () => ColumnOption[];

        setColumns: (columnDefinitions: ColumnOption[]) => void;

        setSortColumn: (columnId: string, ascending: boolean) => void;

        setSortColumns: (cols: ColumnSort[]) => void;

        updateColumnHeader: (columnId: string, title: string, toolTip: string) => string;

        /**
        * Adds an "overlay" of CSS classes to cell DOM elements. SlickGrid can have many such overlays associated with different keys and they are frequently used by plugins. For example, SlickGrid uses this method internally to decorate selected cells with selectedCellCssClass (see options).
        */
        addCellCssStyles: (key: string, hash: any) => void;

        /**
        * Returns true if you can click on a given cell and make it the active focus.
        */
        canCellBeActive: (row: number, col: number) => boolean;

        /**
        * Returns true if selecting the row causes this particular cell to have the selectedCellCssClass applied to it. A cell can be selected if it exists and if it isn't on an empty / "Add New" row and if it is not marked as "unselectable" in the column definition.
        */
        canCellBeSelected: (row: number, col: number) => boolean;

        /**
        * Attempts to switch the active cell into edit mode. Will throw an error if the cell is set to be not editable. Uses the specified editor, otherwise defaults to any default editor for that given cell.
        */
        editActiveCell: (editor: any) => void;

        /**
        * Flashes the cell twice by toggling the CSS class 4 times.
        */
        flashCell: (row: number, cell: number, speed: number) => void;

        /**
        *  Returns an object representing the coordinates of the currently active cell
        */
        getActiveCell: () => CellCoordinates;


        /**
        * Returns the DOM element containing the currently active cell. If no cell is active, null is returned.
        */
        getActiveCellNode: () => HTMLElement;

        /**
        * Returns an object representing information about the active cell's position. All coordinates are absolute and take into consideration the visibility and scrolling position of all ancestors.
        */
        getActiveCellPosition: () => CellPosition;

        /**
        * Accepts a key name, returns the group of CSS styles defined under that name. 
        */
        getCellCssStyles: (key: string) => any;

        /**
        * Returns the active cell editor. If there is no actively edited cell, null is returned.
        */
        getCellEditor: () => any;

        /**
        * Returns a hash containing row and cell indexes from a standard W3C/jQuery event.
        */
        getCellFromEvent: (e: Event) => any;

        /**
        * Returns a hash containing row and cell indexes. Coordinates are relative to the top left corner of the grid beginning with the first row (not including the column headers).
        */
        getCellFromPoint: (x: number, y: number) => any;

        /**
        * Returns a DOM element containing a cell at a given row and cell.
        */
        getCellNode: (row: number, cell: number) => HTMLElement;

        /**
        * Returns an object representing information about a cell's position. All coordinates are absolute and take into consideration the visibility and scrolling position of all ancestors. 
        */
        getCellNodeBox: (row: number, cell: number) => CellPosition;

        /**
        * Accepts a row integer and a cell integer, scrolling the view to the row where row is its row index, and cell is its cell index. Optionally accepts a forceEdit boolean which, if true, will attempt to initiate the edit dialogue for the field in the specified cell.
        * Unlike setActiveCell, this scrolls the row into the viewport and sets the keyboard focus.
        */
        gotoCell: (row: number, cell: number, forceEdit: boolean) => void;

        invalidateRow: (row: number) => void;

        /**
        * Switches the active cell one row down skipping unselectable cells. Returns a boolean saying whether it was able to complete or not.
        */
        navigateDown: () => void;

        /**
        * Switches the active cell one cell left skipping unselectable cells. Unline navigatePrev, navigateLeft stops at the first cell of the row. Returns a boolean saying whether it was able to complete or not.
        */
        navigateLeft();

        /**
        * Tabs over active cell to the next selectable cell. Returns a boolean saying whether it was able to complete or not.
        */
        navigateNext();

        /**
        * Tabs over active cell to the previous selectable cell. Returns a boolean saying whether it was able to complete or not.
        */
        navigatePrev();

        /**
        * Switches the active cell one cell right skipping unselectable cells. Unline navigateNext, navigateRight stops at the last cell of the row. Returns a boolean saying whether it was able to complete or not.
        */
        navigateRight();

        /**
        * Switches the active cell one row up skipping unselectable cells. Returns a boolean saying whether it was able to complete or not.
        */
        navigateUp();

        render();

        /**
         *Removes an "overlay" of CSS classes from cell DOM elements.
         *@param key a string key 
         */
        removeCellCssStyles(key: string);

        /**
         *Resets active cell.
         */
        resetActiveCell();

        /**
         *Sets an active cell.
        */
        setActiveCell(row: number, cell: number);

        /**
         *Sets CSS classes to specific grid cells by calling removeCellCssStyles(key) followed by addCellCssStyles(key, hash).
         *@param key name for this set of styles so you can reference it later - to modify it or remove it, for example. 
         *@param hash a per-row-index, per-column-name nested hash of CSS classes to apply.
        */
        setCellCssStyles(key: string, hash: { [rowIndex: number]: any; });


        updateRowCount: () => void;

        /**
         *Returns the DIV element matching class grid-canvas, which contains every data row currently being rendered in the DOM.
        */
        getCanvasNode(): HTMLElement;

        //#region Event Handlers
        public onAddNewRow: ISubscribable;
        //#endregion

    }

    export class CellSelectionModel {
        constructor();
    }

    export module Editors {
        export var Checkbox: any;
        export var Text: any;
        export var LongText: any;
        export var PercentComplete: any;
        export var Date: any;
    }

    export module Formatters {
        export var PercentCompleteBar: (row : number, cell : number, value, columnDef, dataContext) => string;
        export var Checkmark: any;
    }

    //#region Events
    export interface eventArgs {
        item: any;
    }

    export interface ISubscribable {
        subscribe: (fn: (e: Event, args: eventArgs) => void) => void;
    }
    //#endregion
}