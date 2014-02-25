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

    //from http://stackoverflow.com/questions/3326494/parsing-css-in-javascript-jquery
    export function rulesForCssText(styleContent: string) : CSSRuleList {
        var doc = document.implementation.createHTMLDocument(""),
        styleElement = document.createElement("style");

        styleElement.textContent = styleContent;
        // the style will only be parsed once it is added to a document
        doc.body.appendChild(styleElement);

        return <CSSRuleList> styleElement.sheet['cssRules'];
    };

    export function CalculateSpecificity(selector: string) : number {


        // Ported from http://ruby-css-parser.googlecode.com/svn/trunk/lib/css_parser.rb
        // Patterns for specificity calculations:
        // http://ruby-css-parser.googlecode.com/svn/trunk/lib/css_parser/regexps.rb
        var a = 0;
        var b = RegexOccurrences(selector, "\#");
        var c = RegexOccurrences(selector, "(\.[\w]+)|(\[[\w]+)|(\:(link|first\-child|lang))");
        var d = RegexOccurrences(selector, "((^|[\s\+\>]+)[\w]+|\:(first\-line|first\-letter|before|after))");
        var bs = 100; //base
        return d + (c + (a + bs * b) * bs) * bs;
    }

    function RegexOccurrences(input: string , pattern: string) : number {
        //    const RegexOptions options = RegexOptions.IgnoreCase
        //| RegexOptions.CultureInvariant
        //| RegexOptions.IgnorePatternWhitespace;
        //return Regex.Matches(input, pattern, options).Count;
        var regExp = new RegExp(pattern, 'i');
        return regExp.exec(input).length;
    }

    export function ready() {
        window.removeEventListener('load', ready);
        var attributeLinkStyles = document.querySelectorAll('style[data-attribute-link]');
        var docOrder = 0;
        var directives : IStyleDirective[] = [];
        for (var i = 0, n = attributeLinkStyles.length; i < n; i++){
            //#region analyze style tag
            var attribeLinkStyleNode = <HTMLStyleElement> attributeLinkStyles[i];
            var attributeLink = attribeLinkStyleNode.getAttribute('data-attribute-link');
            if (attributeLink.length === 0) attributeLink = 'Attributes';
            var attributeClasses: IStyleDirective[] = [];
            var content = attribeLinkStyleNode.innerHTML;
            var styleSheet = rulesForCssText(content);
            for (var j = 0, m = styleSheet.length; j < m; j++) {
                //#region analyze style
                var rule = <CSSRule> styleSheet[j];
                var styleDirective : IStyleDirective = {
                    CSSRule: rule,
                    DocOrder: docOrder++,
                    //Node = attribeLinkStyleNode,
                };
                if (rule.cssText.indexOf(attributeLink) > -1) {
                    attributeClasses.push(styleDirective);
                }
                else {
                    
                    if (attributeClasses.length > 0) {
                        directives.push(styleDirective);
                        styleDirective.AttributeDirectives = attributeClasses;
                        attributeClasses = [];
                    }
                }
                //#endregion
            }
            //#endregion
        }
        var sortedDirectives = directives.sort(sortFn);
        for (var i = 0, n = sortedDirectives.length; i < n; i++) {
            var cssRule = sortedDirectives[i];
            var sortedAttributeChanges = cssRule.AttributeDirectives.sort(sortFn);
            var targetElements = document.querySelectorAll(cssRule.CSSRule.cssText);
            for (var j = 0, m = targetElements.length; j < m; j++) {
                for (var k = 0, l = sortedAttributeChanges.length; k < l; k++) {
                    var attributeDir = sortedAttributeChanges[k];
                    var srcElements = document.querySelectorAll(attributeDir.CSSRule.cssText);
                    for (var i1 = 0, n1 = srcElements.length; i1 < n1; i1++) {
                        var srcElement = <HTMLElement> srcElements[i1];
                        var elMode = srcElement.getAttribute('data-mode');
                        if (elMode.length > 0 && elMode != 'client-side-only') continue;
                        var attribs = srcElement.attributes;
                        for (var j1 = 0, m1 = targetElements.length; j1 < m1; j1++) {
                            var targetElement = <HTMLElement> targetElements[j1];
                            for (var k1 = 0, l1 = attribs.length; k1 < l1; k1++) {
                                var attrib = attribs[k1];
                                var nm = attrib.name;
                                switch (nm) {
                                    case "class":
                                    case "hidden":
                                    case "data-mode":
                                        continue;
                                    case "data-class":
                                        //targetElement.addClass(attrib.value);
                                        alert('not implemented');
                                        debugger;
                                        break;
                                    case "data-hidden":
                                        targetElement.setAttribute("hidden", attrib.value);
                                        break;
                                    case "data-data-mode":
                                        targetElement.setAttribute("data-mode", attrib.value);
                                        break;
                                    default:
                                        targetElement.setAttribute(nm, attrib.value);
                                        break;
 
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function sortFn(a: IStyleDirective, b: IStyleDirective): number {
        var as = CalculateSpecificity(a.CSSRule.cssText);
        var bs = CalculateSpecificity(b.CSSRule.cssText);
        if (as > bs) return 1;
        if (as < bs) return 0;
        return -1;
    }
}
window.addEventListener("load", DBS.cs.ready, false);