///<reference path='DBS.ts'/>
///<reference path='DBS_b.ts'/>
///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>

var DBS;
(function (DBS) {
    (function (cs) {
        function mergeHybridIframe(config) {
            var vif = document.getElementById(config.destID);
            onPropChange(vif, 'src', function (el) {
                //TODO:  check if src really changed
                loadVirtualIFrame(el, config);
            });
            loadVirtualIFrame(vif, config);
        }
        cs.mergeHybridIframe = mergeHybridIframe;

        function loadVirtualIFrame(vif, config) {
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
                return;
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

        function onPropChange(el, attrName, handler) {
            if (typeof (MutationObserver) !== 'undefined') {
                var mo = MutationObserver;
                var observer = new mo(function (mrs) {
                    for (var i = 0, n = mrs.length; i < n; i++) {
                        var mr = mrs[i];
                        if (mr.attributeName !== attrName)
                            continue;
                        handler(mr.target);
                        break;
                    }
                });

                //TODO:  bring this code back when Typescript refixes this
                //var observer = new MutationObserver((mrs: MutationRecord[]) => {
                //    // Handle mutations
                //    for (var i = 0, n = mrs.length; i < n; i++) {
                //        var mr = mrs[i];
                //        if (mr.attributeName !== attrName) continue;
                //        handler(<HTMLElement> mr.target);
                //        break;
                //    }
                //});
                observer.observe(el, {
                    attributes: true
                });
                //alert('need typescript fix');
            } else if (el['attachEvent']) {
                //TODO:  deprecate eventually - ie 10 and earlier
                el.attachEvent('onpropertychange', function (ev) {
                    if (ev['propertyName'] !== attrName)
                        return;
                    handler(ev.srcElement);
                });
            }
        }
        cs.onPropChange = onPropChange;

        //from http://stackoverflow.com/questions/3326494/parsing-css-in-javascript-jquery
        function rulesForCssText(styleContent) {
            var doc = document.implementation.createHTMLDocument(""), styleElement = document.createElement("style");

            styleElement.textContent = styleContent;

            // the style will only be parsed once it is added to a document
            doc.body.appendChild(styleElement);

            return styleElement.sheet['cssRules'];
        }
        cs.rulesForCssText = rulesForCssText;
        ;

        function CalculateSpecificity(selector) {
            // Ported from http://ruby-css-parser.googlecode.com/svn/trunk/lib/css_parser.rb
            // Patterns for specificity calculations:
            // http://ruby-css-parser.googlecode.com/svn/trunk/lib/css_parser/regexps.rb
            var a = 0;
            var b = RegexOccurrences(selector, "\#");
            var c = RegexOccurrences(selector, "(\.[\w]+)|(\[[\w]+)|(\:(link|first\-child|lang))");
            var d = RegexOccurrences(selector, "((^|[\s\+\>]+)[\w]+|\:(first\-line|first\-letter|before|after))");
            var bs = 100;
            return d + (c + (a + bs * b) * bs) * bs;
        }
        cs.CalculateSpecificity = CalculateSpecificity;

        function RegexOccurrences(input, pattern) {
            //    const RegexOptions options = RegexOptions.IgnoreCase
            //| RegexOptions.CultureInvariant
            //| RegexOptions.IgnorePatternWhitespace;
            //return Regex.Matches(input, pattern, options).Count;
            var regExp = new RegExp(pattern, 'i');
            var tst = regExp.exec(input);
            if (!tst)
                return 0;
            return regExp.exec(input).length;
        }

        function copyAttributes(srcElement, scriptDirectives, targetElements) {
            var elMode = srcElement.getAttribute('data-mode');
            if (elMode && (elMode.length > 0) && (elMode != 'client-side-only'))
                return;
            if (srcElement.tagName == 'SCRIPT') {
                var sd = {
                    scriptTag: srcElement,
                    targetElements: targetElements
                };
                scriptDirectives.push(sd);
            }

            var attribs = srcElement.attributes;
            for (var j1 = 0, m1 = targetElements.length; j1 < m1; j1++) {
                var targetElement = targetElements[j1];
                for (var k1 = 0, l1 = attribs.length; k1 < l1; k1++) {
                    //#region escapes
                    var attrib = attribs[k1];
                    var nm = attrib.name;
                    switch (nm) {
                        case "class":
                        case "hidden":
                        case "data-mode":
                        case "data-attribute-link":
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
                            //console.log('setting ' + nm + ' to ' + attrib.value);
                            targetElement.setAttribute(nm, attrib.value);
                            break;
                    }
                    //#endregion
                }
            }
        }

        function getExpression(expr, bStringify) {
            var len = expr.length;
            var exprVal;
            if (len > 1) {
                if (expr.lastIndexOf(';') == len - 1) {
                    expr = expr.substr(0, len - 1);
                }
            }
            if (bStringify) {
                exprVal = expr;
            } else {
                exprVal = eval('(' + expr + ')');
            }
            return exprVal;
        }

        function applyDirectives(selectableNode, branch) {
            var sQryFilter = '*[data-attribute-link]';
            if (branch)
                sQryFilter += '.dependsOn_' + branch;
            var attributeLinks = document.querySelectorAll(sQryFilter);
            var docOrder = 0;
            var directives = [];
            var scriptDirectives = [];
            for (var i = 0, n = attributeLinks.length; i < n; i++) {
                var attributeLinkNode = attributeLinks[i];
                switch (attributeLinkNode.tagName) {
                    case 'STYLE':
                        if (!document.implementation.createHTMLDocument)
                            continue;

                        //#region analyze style tag
                        var attribeLinkStyleNode = attributeLinks[i];
                        var attributeLink = attribeLinkStyleNode.getAttribute('data-attribute-link');
                        if (attributeLink.length === 0)
                            attributeLink = 'Attributes';
                        var attributeClasses = [];
                        var content = attribeLinkStyleNode.innerHTML;
                        var styleSheet = rulesForCssText(content);
                        for (var j = 0, m = styleSheet.length; j < m; j++) {
                            //#region analyze style
                            var rule = styleSheet[j];
                            var styleDirective = {
                                CSSRule: rule,
                                DocOrder: docOrder++
                            };
                            if (rule.cssText.indexOf(attributeLink) > -1) {
                                attributeClasses.push(styleDirective);
                            } else {
                                if (attributeClasses.length > 0) {
                                    directives.push(styleDirective);
                                    styleDirective.AttributeDirectives = attributeClasses;
                                    attributeClasses = [];
                                }
                            }
                            //#endregion
                        }

                        break;
                    case 'SCRIPT':
                        //var cl = attributeLinkNode.classList;
                        var cl = attributeLinkNode.className.split(' ');
                        var filteredList = _.filter(cl, function (c) {
                            return c.indexOf('dependsOn_') != 0;
                        });
                        var toClass = _.map(filteredList, function (c) {
                            return "." + c;
                        });
                        var sQuery = toClass.join(',');
                        var sd = {
                            scriptTag: attributeLinkNode,
                            targetElements: document.querySelectorAll(sQuery)
                        };
                        scriptDirectives.push(sd);
                        break;
                    default:
                        var targetElements = document.querySelectorAll('.' + attributeLinkNode.className.replace(' ', ','));
                        copyAttributes(attributeLinkNode, scriptDirectives, targetElements);
                        break;
                }
            }
            var sortedDirectives = directives.sort(sortFn);
            for (var i = 0, n = sortedDirectives.length; i < n; i++) {
                var cssRule = sortedDirectives[i];
                var sortedAttributeChanges = cssRule.AttributeDirectives.sort(sortFn);
                var targetElements = selectableNode.querySelectorAll(cssRule.CSSRule['selectorText']);
                for (var j = 0, m = targetElements.length; j < m; j++) {
                    for (var k = 0, l = sortedAttributeChanges.length; k < l; k++) {
                        var attributeDir = sortedAttributeChanges[k];
                        var srcElements = document.querySelectorAll(attributeDir.CSSRule['selectorText']);
                        for (var i1 = 0, n1 = srcElements.length; i1 < n1; i1++) {
                            var srcElement = srcElements[i1];
                            copyAttributes(srcElement, scriptDirectives, targetElements);
                        }
                    }
                }
            }
            for (var i = 0, n = scriptDirectives.length; i < n; i++) {
                //#region get function or attribute name
                var fn = null;
                var varNameD = null;
                var varName = null;
                var exprVal = null;
                var sd = scriptDirectives[i];
                var bStringify = sd.scriptTag.hasAttribute('data-stringify');
                var linkAttrib = sd.scriptTag.getAttribute('data-attribute-link');
                var ih = sd.scriptTag.innerHTML.trim();
                var fnSearch = 'function ';
                var iPosOfFun = ih.indexOf(fnSearch);

                //if (iPosOfFun > -1) {
                //    var iPosOfParen = ih.indexOf('(');
                //    var sc = ih.substring(iPosOfFun + fnSearch.length, iPosOfParen);
                //    fn = eval(sc);
                //} else {
                if (linkAttrib && linkAttrib.length > 0) {
                    varName = linkAttrib;
                    if (bStringify) {
                        varNameD = 'data-' + DBS.b.toSnakeCase(varName);
                    }
                    var expr = ih.trim();
                    var exprValTest = getExpression(expr, bStringify);
                    var sType = typeof (exprValTest);
                    switch (sType) {
                        case 'function':
                            exprVal = exprValTest();
                            break;
                        case 'object':
                            exprVal = exprValTest;
                            break;
                    }
                } else {
                    var varSearch = 'var ';
                    var iPosOfVar = ih.indexOf(varSearch);
                    if (iPosOfVar > -1) {
                        var iPosOfEquals = ih.indexOf('=');
                        varName = ih.substring(iPosOfVar + varSearch.length, iPosOfEquals).trim();
                        if (bStringify) {
                            varNameD = 'data-' + DBS.b.toSnakeCase(varName);
                        }
                        var expr = ih.substring(iPosOfEquals + 1).trim();
                        exprVal = getExpression(expr, bStringify);
                    } else {
                        var sc = sd.scriptTag.innerHTML.replace(';', '').trim();
                        fn = eval(sc);
                    }
                }

                //}
                //#endregion
                //#region Apply to target Elements
                var tes = sd.targetElements;
                for (var j = 0, m = tes.length; j < m; j++) {
                    var te = tes[j];
                    if (te.hasAttribute('data-attribute-link'))
                        continue;
                    if (fn) {
                        fn(te);
                    } else {
                        if (bStringify) {
                            te.setAttribute(varNameD, exprVal);
                        } else {
                            DBS.b.data(te)[varName] = exprVal;
                        }
                    }
                }
                //#endregion
            }
        }

        function ready() {
            if (window.removeEventListener) {
                window.removeEventListener('load', ready);
            } else {
                window.detachEvent('load', ready);
            }
            applyDBS(document);
        }
        cs.ready = ready;

        function onLoadModel(branch) {
            var modelBranch = model[branch];
            if (!modelBranch.changeNotifier)
                modelBranch.changeNotifier = new DBS.b.ChangeNotifier();
            applyDBS(document, branch);
        }
        cs.onLoadModel = onLoadModel;

        function applyDBS(selectableNode, branch) {
            DBS.b.applyEmmet(selectableNode, branch);
            applyDirectives(selectableNode, branch);
            configureCSForms(selectableNode, branch);
            watchForLazyLoadElements(selectableNode, branch);
        }

        function sortFn(a, b) {
            var as = CalculateSpecificity(a.CSSRule.cssText);
            var bs = CalculateSpecificity(b.CSSRule.cssText);
            if (as > bs)
                return 1;
            if (as < bs)
                return 0;
            return -1;
        }

        function configureCSForm(frm) {
            var $frm = $(frm);
            $frm.submit(function (event) {
                $.ajax({
                    url: $(this).attr('action'),
                    type: $(this).attr('method'),
                    data: $(this).serialize() + '&tsp-src=ajaxForm',
                    dataType: $(this).attr('data-type') ? $(this).attr('data-type') : 'html',
                    beforeSend: function (settings) {
                        settings['$frm'] = $frm;
                    },
                    success: function (data) {
                        if (typeof (data) == 'object') {
                            $frm.children().each(function (it, el) {
                                if (el['render']) {
                                    var ren = el;
                                    ren.render(el, data);
                                }
                            });
                        }
                    }
                });
                event.preventDefault();
            });
            if ($frm.attr('data-submit-on') === 'load') {
                $frm.submit();
            }
        }

        function configureCSForms(selectableNode, branch) {
            if (branch) {
                //TODO:
            }
            var frms;
            if (selectableNode['tagName'] == 'FORM') {
                var frm2 = selectableNode;
                if (frm2.getAttribute('data-mode') == 'client-side-only') {
                    configureCSForm(frm2);
                }
                return;
            } else {
                frms = selectableNode.querySelectorAll('form[data-mode="client-side-only"]');
            }
            for (var i = 0, n = frms.length; i < n; i++) {
                configureCSForm(frms[i]);
            }
        }

        //#region LazyLoad
        function watchForLazyLoadElements(selectableNode, branch) {
            if (branch) {
                //TODO:
            }
            var nds = selectableNode.querySelectorAll('.reserved_lazyLoad');
            for (var j = 0, n = nds.length; j < n; j++) {
                var nd = nds[j];
                onPropChange(nd, 'style', handleStyleDisplayChangeEventForLazyLoadedElement);
            }
        }

        function handleStyleDisplayChangeEventForLazyLoadedElement(el) {
            var $el = $(el);

            //var sNewValue = el.style.display;
            var sNewValue = $el.css('display');
            var sOldValue = $.data(el).dbs_display;
            if (!sOldValue)
                sOldValue = 'none';
            if (sNewValue == sOldValue)
                return;

            //if (el.detachEvent) {
            //    el.detachEvent('onpropertychange', handleOnPropertyChange);
            //}
            $.data(el).tsp_display = sNewValue;
            if (!$.data(el).dbs_lazyloaded && (sNewValue !== 'none')) {
                var content = $.trim($el.html());
                el.insertAdjacentHTML('beforebegin', content);
            }
            var newElement = el.previousSibling;
            newElement.style.display = sNewValue;
            newElement.id = newElement.getAttribute('data-originalID');
            applyDBS(newElement);
            el.parentNode.removeChild(el);
        }
        cs.handleStyleDisplayChangeEventForLazyLoadedElement = handleStyleDisplayChangeEventForLazyLoadedElement;
    })(DBS.cs || (DBS.cs = {}));
    var cs = DBS.cs;
})(DBS || (DBS = {}));
if (window.addEventListener) {
    window.addEventListener("load", DBS.cs.ready, false);
} else {
    window.attachEvent('onload', DBS.cs.ready);
}
//# sourceMappingURL=DBS_cs.js.map
