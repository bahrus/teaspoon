///<reference path='DBS.ts'/>

module DBS.cs {
    export interface ISnippetConfig {
        destID: string
    }

    export function mergeHybridIframe(config: ISnippetConfig) {
        var vif = document.getElementById(config.destID); //virtual iframe
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

    export function substringAfter(val: string, search: string) {
        var iS = val.indexOf(search);
        if (iS == -1) return "";
        return val.substr(iS);
    }
}