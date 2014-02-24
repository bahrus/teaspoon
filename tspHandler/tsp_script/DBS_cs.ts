///<reference path='DBS.ts'/>

module DBS.cs {
    export interface ISnippetConfig {
        destID: string
    }

    export function mergeHybridIframe(config: ISnippetConfig) {
        var vif = document.getElementById(config.destID); //virtual iframe
        onPropChange(vif, 'src', (el: HTMLElement) => {
            //TODO:  check if src really changed
            loadVirtualIFrame(el, config);
        });
        loadVirtualIFrame(vif, config);
        

    }

    function loadVirtualIFrame(vif: HTMLElement, config: ISnippetConfig) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var vifl = document.getElementById(config.destID);
                vifl.innerHTML = xmlhttp.responseText;
            }
        };
        var url = vif.getAttribute('src');
        var sp = url.split('#');
        if (sp.length == 0) {
            return; //TODO -- error handle?
        }
        var id = sp[1];
        url = sp[0];
        var bHasQ = url.indexOf('?') > 0;
        url += (bHasQ ? '&' : '?');
        url += ('DBS.src=' + 'hif');
        url += ('&DBS.id=' + id);
        xmlhttp.open("GET", url);
        xmlhttp.send();
    }


    export function onPropChange(el: HTMLElement, attrName: string, handler: (el: HTMLElement) => any) {
        if (typeof (MutationObserver) !== 'undefined') {
            var observer = new MutationObserver((mrs: MutationRecord[]) => {
                // Handle mutations
                for (var i = 0, n = mrs.length; i < n; i++) {
                    var mr = mrs[i];
                    if (mr.attributeName !== attrName) continue;
                    handler(<HTMLElement> mr.target);
                    break;
                }
            });
            observer.observe(el, {
                attributes: true,
            });
        } else if (el['attachEvent']) {
            //TODO:  deprecate eventually - ie 10 and earlier
            el.attachEvent('onpropertychange', (ev: Event) => {
                if (ev['propertyName'] !== attrName) return;
                handler(<HTMLElement> ev.srcElement);
            });
        }
    }


}