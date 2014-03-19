///<reference path='DBS_b.ts'/>

module DBS.ss {

    export function ready() {
        console.log('in ready');
        var dbsOnloadEls = document.querySelectorAll('*[data-dbs-onload]');
        
        
        for (var i = 0, n = dbsOnloadEls.length; i < n; i++) {
            var dbsOnloadEl = <HTMLElement> dbsOnloadEls[i];
            var fnString = dbsOnloadEl.getAttribute('data-dbs-onload');
            var fns = fnString.split(';');

            for (var j = 0, m = fns.length; j < m; j++) {
                var fn = eval( fns[j] );
                fn(dbsOnloadEl);
            }
        }
        DBS.b.applyEmmet(document);
    }

}

DBS.ss.ready();