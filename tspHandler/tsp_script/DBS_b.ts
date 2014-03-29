///<reference path='emmet.d.ts'/>
declare var mode: string;
module DBS.b{

    export function isCSMode() : boolean {
        return (typeof (mode) == 'undefined' || mode !== 'server');
    }

    export function applyEmmet(selectedNode: NodeSelector) {
        var cs = isCSMode();
        var emmetSelector = 'script[type="text/emmet"][data-mode="';
        if (cs) {
            emmetSelector += 'client-side-only';
        } else {
            emmetSelector += 'server-side-only'
        }
        emmetSelector += '"]';
        var emmetNodes = selectedNode.querySelectorAll(emmetSelector);
        for (var i = 0, n = emmetNodes.length; i < n; i++) {
            var nd = <HTMLElement> emmetNodes[i];
            var inner = nd.innerHTML.trim();
            var content = emmet.expandAbbreviation(inner, 'html', 'html', null).split('${0}').join('');
            //var templ = nd.getAttribute('data-processor');
            //if (templ) {
            //    var fn = eval(templ);
            //    content = fn(content);
            //}
            nd.insertAdjacentHTML('beforebegin', content);
            var prevSibling = <HTMLElement> nd.previousSibling;
            nd.parentNode.removeChild(nd);

        }
    }

     

    export function MakeRCsUnique(el: HTMLElement) {
        var rcELS = el.querySelectorAll('*[data-rc]');
        var row = 0;
        for (var i = 0, n = rcELS.length; i < n; i++) {
            var rcEL = <HTMLElement> rcELS[i];
            var rc = rcEL.getAttribute('data-rc');
            if (rc == 'r,1') {
                row++;
            }
            rc = rc.replace('r,', row + ',');
            rcEL.setAttribute('data-rc', rc);
        }
    }
} 