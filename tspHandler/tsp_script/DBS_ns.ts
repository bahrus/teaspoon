module DBS.ns {
    export function ready() {
        window.removeEventListener('load', ready);
        var lazyLoads = document.querySelectorAll('*[data-display="lazy"]');
        for (var i = 0, n = lazyLoads.length; i < n; i++) {
            var el = <HTMLElement> lazyLoads[i];
            el.style.display = 'none';
        }
    }
} 

window.addEventListener("load", DBS.ns.ready, false);