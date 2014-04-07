///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_b.ts'/>
///<reference path='DBS_cs.ts'/>



module tsp.cs {

    var db = DBS.b;

    function getOrCreateFormElements$(targetForms$: JQuery, fldName: string): HTMLInputElement[] {
        var returnObj: HTMLInputElement[] = [];
        targetForms$.each((idx, frm) => {
            var inpFlds = frm.querySelectorAll('input[name="' + fldName + '"]');
            var inpFld: HTMLInputElement;
            if (inpFlds.length == 0) {
                inpFld = <HTMLInputElement> document.createElement('input');
                inpFld.type = 'hidden';
                inpFld.name = fldName;
                frm.appendChild(inpFld);
                returnObj.push(inpFld);
            } else {
                for (var i = 0, n = inpFlds.length; i < n; i++) {
                    returnObj.push(<HTMLInputElement> inpFlds[i]);
                }
            }
        });
        return returnObj;
    }

    export function addScroll(el: HTMLElement) {
        var scrollOptions = <tsp.b.IScrollOptions> DBS.b.extractDirective(el, 'scrollOptions');
        //el.style.height = ['height'] + 'px';
        var innerDiv = document.createElement('div');
        innerDiv.innerHTML = '&nbsp';
        switch (scrollOptions.direction) {
            case tsp.b.DirectionOptions.Vertical:
                el.style.overflowY = 'auto';
                var outerHeight = el.clientHeight;
                var innerHeight = scrollOptions.maxElementSize * scrollOptions.maxValue;
                innerDiv.style.height = innerHeight + 'px';
                break;
            case tsp.b.DirectionOptions.Horizontal:
                el.style.overflowX = 'auto';
                var outerWidth = el.clientWidth;
                var innerWidth = scrollOptions.maxElementSize * scrollOptions.maxValue;

                innerDiv.style.width = innerWidth + 'px';
                break;
        }

        el.appendChild(innerDiv);
        var ft = scrollOptions.formTargets;
        if (ft) {

            el.addEventListener('scroll', scrollListener, false);

            //el.attachEvent('scroll', scrollListener);
        }
    }

    function scrollListener(evt: Event) {

        //console.log(evt);
        var src = <HTMLDivElement> evt.srcElement;
        var scrollOptions = <tsp.b.IScrollOptions> DBS.b.data(src)['scrollOptions'];
        var newVal;
        switch (scrollOptions.direction) {
            case tsp.b.DirectionOptions.Horizontal:
                newVal = Math.floor(src.scrollLeft / scrollOptions.maxElementSize);
                break;
            case tsp.b.DirectionOptions.Vertical:
                newVal = Math.floor(src.scrollTop / scrollOptions.maxElementSize);
                break;
        }

        if (newVal !== scrollOptions.currentValue) {
            console.log(newVal);
            scrollOptions.currentValue = newVal;
            var ft = scrollOptions.formTargets;
            var fields = getOrCreateFormElements$(ft, src.id + '_ScrollVal');
            for (var i = 0, n = fields.length; i < n; i++) {
                var fld = fields[i];
                fld.value = newVal.toString();
            }
        }
    }


    export function fillGrid(el: HTMLElement) {
        var fgo = tsp.b.fillGrid(el);
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

        }
        if (fgo.horizontalOffsetFld) {
            if (db.isCSMode()) {
                var hof = fgo.horizontalOffsetFld;
                var hofd = db.data(hof);
                if (!hofd.dependantGrids) {
                    hofd.dependantGrids = [];
                }
                hofd.dependantGrids.push(el);
                DBS.cs.onPropChange(fgo.horizontalOffsetFld, 'value', horizontalOffsetChangeHandler);
            }
        }
    }

    function verticalOffsetChangeHandler(verticalOffsetFld: HTMLElement) {
        var dgs = <HTMLElement[]> db.data(verticalOffsetFld).dependantGrids;
        for (var i = 0, n = dgs.length; i < n; i++) {
            var el = dgs[i];
            var fgo = <tsp.b.IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
            tsp.b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }

    function horizontalOffsetChangeHandler(horizontalOffsetFld: HTMLInputElement) {
        var dgs = <HTMLElement[]> db.data(horizontalOffsetFld).dependantGrids;
        for (var i = 0, n = dgs.length; i < n; i++) {
            var el = dgs[i];
            var fgo = <tsp.b.IFillGridOptions> db.extractDirective(el, 'fillGridOptions');
            tsp.b.refreshHeaderTemplateWithRectCoords(el, fgo);
            tsp.b.refreshBodyTemplateWithRectCoords(el, fgo.verticalOffsetFld, fgo);
        }
    }
}
 