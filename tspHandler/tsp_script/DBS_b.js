///<reference path='emmet.d.ts'/>

//ie8 polyfill
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
}

var DBS;
(function (DBS) {
    (function (b) {
        function isCSMode() {
            return (typeof (mode) == 'undefined' || mode !== 'server');
        }
        b.isCSMode = isCSMode;

        var uidCounter = 0;

        function getOrCreateID(el) {
            if (!el.id) {
                el.id = 'DBS_' + uidCounter++;
            }
            return el.id;
        }
        b.getOrCreateID = getOrCreateID;

        b.dataExpando = isCSMode() ? 'data-cs-cache' : 'data-ss-cache';
        var cache = [{}];
        function data(elem) {
            var cacheIndex = elem.getAttribute(b.dataExpando), nextCacheIndex = cache.length;
            var nCacheIndex;
            if (!cacheIndex) {
                elem.setAttribute(b.dataExpando, nextCacheIndex.toString());
                cache[nextCacheIndex] = {};
                nCacheIndex = nextCacheIndex;
            } else {
                nCacheIndex = parseInt(cacheIndex);
            }
            if (!cache[nCacheIndex])
                cache[nextCacheIndex] = {};
            return cache[nCacheIndex];
        }
        b.data = data;

        

        function $$(emmetS) {
            var props = { emmetString: emmetS };
            applyMethods(props);
            return props;
        }
        b.$$ = $$;

        function applyMethods(props) {
            if (!props.$)
                props.$ = partial($, props);
            if (!props.appendTo)
                props.appendTo = partial(appendTo, props);
        }

        function format(str, props) {
            var res = str;
            for (var key in props) {
                res = res.replace('{' + key + '}', props[key]);
            }
            return res;
        }
        b.format = format;

        function $(props) {
            var pa = props.attr, el = props.el, acl = props.addClassList;
            if (!el) {
                var tn = props.tagName;
                if (tn) {
                    props.el = document.createElement(tn);
                    el = props.el;
                }
            }
            if (pa) {
                for (var a in pa) {
                    el.setAttribute(a, pa[a]);
                }
            }
            if (acl) {
                var cl = el.classList;
                for (var i = 0, n = acl.length; i < n; i++) {
                    var ac = acl[i];
                    if (!cl.contains(ac))
                        cl.add(ac);
                }
            }
            if (props.text) {
                el.textContent = props.text;
            }
            applyMethods(props);
            return props;
        }
        b.$ = $;

        function appendTo(props, parent) {
            if (props.el) {
                parent.appendChild(props.el);
                return props;
            }
            if (props.emmetString) {
                parent.insertAdjacentHTML('beforeend', expEmmet(props.emmetString));
            }
        }

        function expEmmet(str) {
            return emmet.expandAbbreviation(str, 'html', 'html', null).split('${0}').join('');
        }

        function applyEmmet(selectedNode, branch) {
            var cs = isCSMode();
            var emmetSelector = 'script[type="text/emmet"][data-mode="';
            if (cs) {
                emmetSelector += 'client-side-only';
            } else {
                emmetSelector += 'server-side-only';
            }
            emmetSelector += '"]';
            if (branch) {
                emmetSelector += '.dependsOn_' + branch;
            }
            var emmetNodes = selectedNode.querySelectorAll(emmetSelector);
            for (var i = 0, n = emmetNodes.length; i < n; i++) {
                var nd = emmetNodes[i];
                if (!branch) {
                    if (nd.className.indexOf('dependsOn_') > -1)
                        continue;
                }
                var inner = nd.innerHTML.trim();
                var content = expEmmet(inner);

                //var templ = nd.getAttribute('data-processor');
                //if (templ) {
                //    var fn = eval(templ);
                //    content = fn(content);
                //}
                nd.insertAdjacentHTML('beforebegin', content);
                var prevSibling = nd.previousSibling;
                nd.parentNode.removeChild(nd);
            }
        }
        b.applyEmmet = applyEmmet;

        function MakeRCsUnique(el) {
            var rcELS = el.querySelectorAll('*[data-rc]');
            var row = 0;
            for (var i = 0, n = rcELS.length; i < n; i++) {
                var rcEL = rcELS[i];
                var rc = rcEL.getAttribute('data-rc');
                if (rc == 'r,1') {
                    row++;
                }
                rc = rc.replace('r,', row + ',');
                rcEL.setAttribute('data-rc', rc);
            }
        }
        b.MakeRCsUnique = MakeRCsUnique;

        function extractDirective(el, prop) {
            //var $el = $(el);
            var d = DBS.b.data(el)[prop];
            if (d)
                return d;
            var attName = 'data-' + toSnakeCase(prop);
            var da = el.getAttribute(attName);
            if (da) {
                return eval('(' + da + ')');
            }
        }
        b.extractDirective = extractDirective;

        var lcUpRegExp = /([a-z])([A-Z])/g;
        function toSnakeCase(s) {
            return s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        }
        b.toSnakeCase = toSnakeCase;

        //export interface INotifyListeners{
        //    //addChangeListener<T>(callBack: (T) => void);
        //    changeListeners?: { (t: any): void }[];
        //    addChangeListener:  function(callBack: (a: any => void));
        //}
        var ChangeNotifier = (function () {
            function ChangeNotifier() {
                this._changeListeners = [];
            }
            ChangeNotifier.prototype.addChangeListener = function (callBack) {
                this._changeListeners.push(callBack);
            };
            ChangeNotifier.prototype.notifyListeners = function (t) {
                //console.log('DBS.b.notifyListeners');
                var cls = this._changeListeners;
                if (!cls)
                    return;
                for (var i = 0, n = cls.length; i < n; i++) {
                    var cl = cls[i];
                    cl(t);
                }
            };
            return ChangeNotifier;
        })();
        b.ChangeNotifier = ChangeNotifier;

        function partial(func, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
            var args = Array.prototype.slice.call(arguments, 1);
            return function () {
                var allArguments = args.concat(Array.prototype.slice.call(arguments));
                return func.apply(this, allArguments);
            };
        }
    })(DBS.b || (DBS.b = {}));
    var b = DBS.b;
})(DBS || (DBS = {}));
//# sourceMappingURL=DBS_b.js.map
