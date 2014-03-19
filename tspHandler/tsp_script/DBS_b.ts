///<reference path='emmet.d.ts'/>
declare var mode: string;
module DBS.b{
    export function applyEmmet(selectedNode: NodeSelector) {
        var cs = (typeof (mode) == 'undefined' || mode !== 'server');
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
} 