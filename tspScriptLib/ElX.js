var tsp;
(function (tsp) {
    function ParentElementToggleClickHandler(tEvent) {
        var elX = tEvent.elX;
        var kids = elX.kidElements;
        if(!kids) {
            return;
        }
        for(var i = 0, n = kids.length; i < n; i++) {
            var kid = kids[i];
            var bI = kid.bindInfo;
            if(bI.collapsed) {
                delete bI.collapsed;
                var target = kid.el;
                kid.innerRender({
                    targetDom: target
                });
                kid.removeClass('collapsed');
            } else {
                if(bI.toggleKidsOnParentClick) {
                    bI.collapsed = true;
                    kid.ensureClass('collapsed');
                }
            }
        }
    }
    function SelectElementClickHandler(tEvent) {
        var elX = tEvent.elX;
        var ss = elX.bindInfo.selectSettings;
        var newVal = !elX.selected;
        var grp = ss.group ? ss.group : 'global';
        if(!ss) {
            return;
        }
        tsp._.clearSelections(grp, false);
        if(newVal) {
            tsp._.setSelection(grp, elX);
        }
    }
    var ElX = (function () {
        function ElX(bindInfo) {
            this.bindInfo = bindInfo;
            if(!bindInfo.attributes) {
                bindInfo.attributes = {
                };
            }
            var id = bindInfo.id;
            if(!id) {
                id = tsp._.getUID();
            }
            this.bindInfo.attributes['ID'] = id;
            tsp._.objectLookup[id] = this;
            var da = bindInfo.dynamicAttributes;
            if(da) {
                for(var attribName in da) {
                    var dynA = da[attribName];
                    this.bindInfo.attributes[attribName] = dynA(this);
                }
            }
            var dc = bindInfo.dynamicClasses;
            if(dc) {
                for(var className in dc) {
                    var dynC = dc[className];
                    if(dynC(this)) {
                        this.ensureClass(className);
                    }
                }
            }
            if(bindInfo.classes) {
                bindInfo.attributes['class'] = bindInfo.classes.join(' ');
                delete bindInfo.classes;
            }
            var styles = bindInfo.styles;
            var ds = bindInfo.dynamicStyles;
            if(ds) {
                for(var styleName in ds) {
                    var dynS = ds[styleName];
                    if(!styles) {
                        styles = {
                        };
                        bindInfo.styles = styles;
                    }
                    styles[styleName] = dynS(this);
                }
            }
            if(styles) {
                var style = '';
                for(var prop in styles) {
                    style += (prop + ':' + styles[prop] + ';');
                }
                bindInfo.attributes['style'] = style;
                delete bindInfo.styles;
            }
        }
        ElX.prototype.ensureClass = function (className) {
            var bI = this.bindInfo;
            if(!this._rendered) {
                if(!bI.classes) {
                    bI.classes = [];
                }
                var c = bI.classes;
                if(c.indexOf(className) != -1) {
                    return;
                }
                c.push(className);
                return;
            }
            var el = this.el, cl = el.classList;
            if(cl) {
                cl.add(className);
                return;
            } else {
                backwardsComp.ensureClass(el, className);
            }
        };
        ElX.prototype.hasClass = function (className) {
            var bI = this.bindInfo;
            if(!this._rendered) {
                if(!bI.classes) {
                    return false;
                }
                var c = bI.classes;
                var i = c.indexOf(className);
                return (i != -1);
            }
            var cl = this.el.classList;
            return cl.contains(className);
        };
        ElX.prototype.removeClass = function (className) {
            var bI = this.bindInfo;
            if(!this._rendered) {
                if(!bI.classes) {
                    return;
                }
                var c = bI.classes;
                var i = c.indexOf(className);
                if(i == -1) {
                    return;
                }
                c.splice(i, 1);
                return;
            }
            var cl = this.el.classList;
            if(cl) {
                this.el.classList.remove(className);
            } else {
                backwardsComp.removeClass(this.el, className);
            }
        };
        ElX.prototype.doRender = function (context) {
            context.elements.push(this);
            var bI = this.bindInfo;
            if(bI.toggleKidsOnParentClick) {
                tsp._.addWindowEventListener({
                    elX: this.parentElement,
                    topicName: 'click',
                    callback: ParentElementToggleClickHandler
                });
            }
            var ss = bI.selectSettings;
            if(ss) {
                tsp._.addWindowEventListener({
                    elX: this,
                    topicName: 'click',
                    callback: SelectElementClickHandler
                });
                if(ss.selected) {
                    this.ensureClass(ss.selClassName ? ss.selClassName : 'selected');
                } else {
                    if(ss.unselClassName) {
                        this.ensureClass(ss.unselClassName);
                    }
                }
            }
            context.output += '<' + bI.tag;
            var attribs = bI.attributes;
            for(var attrib in attribs) {
                context.output += ' ' + attrib + '="' + attribs[attrib] + '"';
            }
            var dynamicAttribs = bI.dynamicAttributes;
            if(dynamicAttribs) {
                for(var dynamicAttrib in dynamicAttribs) {
                    context.output += ' ' + dynamicAttrib + '="' + dynamicAttribs[dynamicAttrib](this) + '"';
                }
            }
            context.output += '>';
            if(bI.textGet) {
                context.output += bI.textGet(this);
            } else {
                if(bI.text) {
                    context.output += bI.text;
                }
            }
            if(!bI.collapsed) {
                this.doInnerRender(context);
            }
            context.output += '</' + bI.tag + '>';
        };
        ElX.prototype.doInnerRender = function (context) {
            var bI = this.bindInfo;
            var children = bI.kidsGet ? bI.kidsGet(this) : bI.kids;
            if(children) {
                if(!this._kidIds) {
                    this._kidIds = [];
                }
                for(var i = 0, n = children.length; i < n; i++) {
                    var child = children[i];
                    child.parentElement = this;
                    child.doRender(context);
                    this._kidIds.push(child.ID);
                }
            }
            this._innerRendered = true;
        };
        ElX.prototype.render = function (settings) {
            var renderContext = new RenderContext(settings);
            var s = renderContext.settings;
            var target;
            if(s.targetDom) {
                target = s.targetDom;
            } else {
                target = document.getElementById(renderContext.settings.targetDomID);
            }
            tsp._.cleanUp(target);
            this.doRender(renderContext);
            target.innerHTML = renderContext.output;
            var els = renderContext.elements;
            for(var i = els.length - 1; i > -1; i--) {
                var el = els[i];
                el.notifyAddedToDOM();
            }
            delete renderContext.elements;
            var s = renderContext.settings;
            delete s.targetDom;
        };
        ElX.prototype.innerRender = function (settings) {
            if(this._innerRendered) {
                return;
            }
            var renderContext = new RenderContext(settings);
            this.doInnerRender(renderContext);
            var target = this.el;
            target.innerHTML = renderContext.output;
            var els = renderContext.elements;
            for(var i = els.length - 1; i > -1; i--) {
                var el = els[i];
                el.notifyAddedToDOM();
            }
            this._innerRendered = true;
        };
        Object.defineProperty(ElX.prototype, "ID", {
            get: function () {
                if(!this._rendered) {
                    return this.bindInfo.attributes['ID'];
                }
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElX.prototype, "contentEditable", {
            get: function () {
                if(this._rendered) {
                    return this.el.contentEditable;
                }
                return this.getAttr('contenteditable');
            },
            set: function (val) {
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElX.prototype, "parentElement", {
            get: function () {
                if(this._rendered) {
                    var pd = this.parentDOM;
                    return pd ? tsp._.objectLookup[pd.id] : null;
                }
                ; ;
                return tsp._.objectLookup[this._parentId];
            },
            set: function (elem) {
                this._parentId = elem.ID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElX.prototype, "parentDOM", {
            get: function () {
                var elD = this.el;
                return elD ? elD.parentElement : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElX.prototype, "kidElements", {
            get: function () {
                var returnObj = [];
                if(this._rendered) {
                    var children = this.childrenDOM;
                    for(var child in children) {
                        var childDom = children[child];
                        var childEl = tsp._.objectLookup[childDom['id']];
                        if(childEl) {
                            returnObj.push(childEl);
                        }
                    }
                } else {
                    if(this._kidIds) {
                        for(var i = 0, n = this._kidIds.length; i < n; i++) {
                            var kidId = this._kidIds[i];
                            returnObj.push(tsp._.objectLookup[kidId]);
                        }
                    }
                }
                return returnObj;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElX.prototype, "childrenDOM", {
            get: function () {
                var elD = this.el;
                return elD ? elD.children : null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElX.prototype, "selected", {
            get: function () {
                var ss = this.bindInfo.selectSettings;
                if(!ss) {
                    return false;
                }
                var s = ss.selClassName ? ss.selClassName : 'selected';
                return this.hasClass(s);
            },
            set: function (newVal) {
                var ss = this.bindInfo.selectSettings;
                if(!ss) {
                    return;
                }
                var s = ss.selClassName ? ss.selClassName : 'selected';
                if(newVal === true) {
                    this.ensureClass(s);
                } else {
                    this.removeClass(s);
                }
                var ssss = ss.selectSet;
                if(ssss) {
                    ssss(this, newVal);
                }
            },
            enumerable: true,
            configurable: true
        });
        ElX.prototype.notifyAddedToDOM = function () {
            this._rendered = true;
            var bI = this.bindInfo;
            this._id = bI.attributes['ID'];
            delete bI.attributes;
            if(!bI.collapsed) {
                delete this._parentId;
                delete this._kidIds;
            }
            delete this.parentElement;
        };
        ElX.prototype.getAttr = function (name) {
            if(this._rendered) {
                var el = this.el;
                return el.getAttribute(name);
            }
            return this.bindInfo.attributes[name];
        };
        ElX.prototype.setAttr = function (name, val) {
            if(this._rendered) {
                var el = this.el;
                el.setAttribute(name, val);
            }
            this.bindInfo.attributes[name] = val;
        };
        ElX.prototype.removeAttr = function (name) {
            if(this._rendered) {
                var el = this.el;
                el.removeAttribute(name);
            } else {
                var attribs = this.bindInfo.attributes;
                delete attribs['checked'];
            }
        };
        ElX.prototype.notifyTextChange = function () {
            if(!this._rendered) {
                return;
            }
            var bI = this.bindInfo;
            if(!bI.textGet) {
                return;
            }
            var newVal = bI.textGet(this);
            var h = this.el;
            if(h.innerHTML === newVal) {
                return;
            }
            h.innerHTML = newVal;
        };
        ElX.prototype.notifyClassChange = function (className) {
            if(!this._rendered) {
                return;
            }
            var bI = this.bindInfo;
            var dynamicClass = bI.dynamicClasses[className];
            if(!dynamicClass) {
                return;
            }
            var newVal = dynamicClass(this);
            if(!newVal) {
                this.removeClass(className);
            } else {
                this.ensureClass(className);
            }
        };
        ElX.prototype.notifyStyleChange = function (styleName) {
            if(!this._rendered) {
                return;
            }
            var bI = this.bindInfo;
            var dynamicStyle = bI.dynamicStyles[styleName];
            if(!dynamicStyle) {
                return;
            }
            var newVal = dynamicStyle(this);
            this.el.style[styleName] = newVal;
        };
        ElX.prototype.notifyAttributeChange = function (attribName) {
            if(!this._rendered) {
                return;
            }
            var bI = this.bindInfo;
            var dynamicAttrib = bI.dynamicAttributes[attribName];
            if(!dynamicAttrib) {
                return;
            }
            var newVal = dynamicAttrib(this);
            this.el.setAttribute(attribName, newVal);
        };
        Object.defineProperty(ElX.prototype, "el", {
            get: function () {
                return document.getElementById(this._id);
            },
            enumerable: true,
            configurable: true
        });
        return ElX;
    })();
    tsp.ElX = ElX;    
    var RenderContext = (function () {
        function RenderContext(settings) {
            this.settings = settings;
            this.output = "";
            this.elements = [];
        }
        return RenderContext;
    })();
    tsp.RenderContext = RenderContext;    
    function Div(bindInfo) {
        bindInfo.tag = 'div';
        return new ElX(bindInfo);
    }
    tsp.Div = Div;
    function Span(bindInfo) {
        bindInfo.tag = 'span';
        return new ElX(bindInfo);
    }
    tsp.Span = Span;
    function UL(bindInfo) {
        bindInfo.tag = 'ul';
        return new ElX(bindInfo);
    }
    tsp.UL = UL;
    function LI(bindInfo) {
        bindInfo.tag = 'li';
        return new ElX(bindInfo);
    }
    tsp.LI = LI;
    function Input(bindInfo) {
        return new tsp.InputElement(bindInfo);
    }
    tsp.Input = Input;
    function LabelForInput(bindInfo) {
        return new tsp.InputLabelElement(bindInfo);
    }
    tsp.LabelForInput = LabelForInput;
    function THead(bindInfo) {
        bindInfo.tag = 'thead';
        return new ElX(bindInfo);
    }
    tsp.THead = THead;
    function TFoot(bindInfo) {
        bindInfo.tag = 'tfoot';
        return new ElX(bindInfo);
    }
    tsp.TFoot = TFoot;
    function TR(bindInfo) {
        bindInfo.tag = 'tr';
        return new ElX(bindInfo);
    }
    tsp.TR = TR;
})(tsp || (tsp = {}));
//@ sourceMappingURL=ElX.js.map
