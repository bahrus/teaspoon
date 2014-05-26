var DBS;
(function (DBS) {
    (function (ns) {
        function ready() {
            window.removeEventListener('load', ready);
            var lazyLoads = document.querySelectorAll('*[data-display="lazy"]');
            for (var i = 0, n = lazyLoads.length; i < n; i++) {
                var el = lazyLoads[i];
                el.style.display = 'none';
            }
        }
        ns.ready = ready;
    })(DBS.ns || (DBS.ns = {}));
    var ns = DBS.ns;
})(DBS || (DBS = {}));

window.addEventListener("load", DBS.ns.ready, false);
//# sourceMappingURL=DBS_ns.js.map
