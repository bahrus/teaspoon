///<reference path='DBS_b.ts'/>
var DBS;
(function (DBS) {
    (function (ss) {
        function ready() {
            console.log('in ready');
            var dbsOnloadEls = document.querySelectorAll('*[data-dbs-onload]');

            for (var i = 0, n = dbsOnloadEls.length; i < n; i++) {
                var dbsOnloadEl = dbsOnloadEls[i];
                var fnString = dbsOnloadEl.getAttribute('data-dbs-onload');
                var fns = fnString.split(';');

                for (var j = 0, m = fns.length; j < m; j++) {
                    var fn = eval(fns[j]);
                    fn(dbsOnloadEl);
                }
            }
            DBS.b.applyEmmet(document);
        }
        ss.ready = ready;
    })(DBS.ss || (DBS.ss = {}));
    var ss = DBS.ss;
})(DBS || (DBS = {}));

DBS.ss.ready();
//# sourceMappingURL=DBS_ss.js.map
