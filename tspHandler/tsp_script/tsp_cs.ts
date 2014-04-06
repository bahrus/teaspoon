///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_b.ts'/>



module tsp.cs {

    function getOrCreateFormElements$(targetForms$: JQuery, fldName: string): HTMLInputElement[]{
        var returnObj: HTMLInputElement[] = [];
        targetForms$.each((idx, frm) => {
            var inpFlds = frm.querySelectorAll('input[name="' + fldName + '"]');
            var inpFld : HTMLInputElement;
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
                innerDiv.innerHTML = '&nbsp';
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

    function scrollListener(evt: Event){

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
} 