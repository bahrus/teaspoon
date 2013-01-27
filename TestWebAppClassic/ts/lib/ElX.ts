///<reference path="_.ts" />
///<reference path="Interface_ElX.ts" />
///<reference path="ie9.ts" />

module tsp {


    export var windowEventListeners: { [name: string]: IListenForTopic[]; } = {};

    //#region selection management
    var selectionChangeListeners: { [name: string]: { (); void; }[]; } = {};
    var selectGroups: { [name: string]: IElX[]; } = {};



    function notifySelectionChange(name: string) {
        var scls = selectionChangeListeners[name];
        if (!scls) return;
        for (var i = 0, n = scls.length; i < n; i++) {
            var scl = scls[i];
            scl();
        }
    }

    export function getSelections(groupName: string) {
        return selectGroups[groupName];
    }

    export function clearSelections(groupName: string, notify: bool) {
        var sel = selectGroups[groupName];
        if (!sel) return;
        for (var i = 0, n = sel.length; i < n; i++) {
            var other = sel[i];
            other.selected = false;
        }
        delete selectGroups[groupName];
        if (notify) {
            notifySelectionChange(groupName);
        }

    }

    export function setSelection(groupName: string, elX: IElX) {
        clearSelections(groupName, false);
        addSelection(groupName, elX, true);
    }

    export function addSelection(groupName: string, elX: IElX, notify: bool) {
        var sel = selectGroups[groupName];
        if (!sel) { sel = []; selectGroups[groupName] = sel; }
        elX.selected = true;
        sel.push(elX);
        if (notify) notifySelectionChange(groupName);
    }

    export function removeSelection(groupName: string, elX: tsp.ElX, notify: bool) {
        var sel = selectGroups[groupName];
        if (!sel) return;
        debugger;//TODO:  remove
    }

    export function addSelectionChangeListener(name: string, callBack: () => void ) {
        var listeners = selectionChangeListeners[name];
        if (!listeners) {
            listeners = [];
            selectionChangeListeners[name] = listeners;
        }
        listeners.push(callBack);
    }

    //#endregion

    export function getGlobalStorage() {
        return {
            objectLookup: tsp._.objectLookup,
            objectListeners: tsp._.SVObjectChangeListeners,
            windowEventListeners: windowEventListeners,
            selectionChangeListeners: selectionChangeListeners,
            selectGroups: selectGroups,
        };
    }

    function ParentElementToggleClickHandler(tEvent: ITopicEvent) {
        var elX = tEvent.elX;
        //var target = <HTMLElement>tEvent.event.target;
        var kids = elX.kidElements;
        if (!kids) return;
        for (var i = 0, n = kids.length; i < n; i++) {
            var kid = kids[i];
            //var target = kid.el;
            var bI = kid.bindInfo;
            if (bI.collapsed) {
                delete bI.collapsed;
                var target = kid.el;
                kid.innerRender({
                    targetDom: target,
                });
                kid.removeClass('collapsed');

            } else if (bI.toggleKidsOnParentClick) {
                bI.collapsed = true;
                kid.ensureClass('collapsed');
                //target.className = 'collapsed';
            }
        }

    }

    function windowEventListener(ev: Event) {
        var evtName = ev.type;
        var topicListenersSettings = windowEventListeners[evtName];
        console.log('windowEventListener.evtName=' + evtName);
        if (!topicListenersSettings) return;
        for (var i = 0, n = topicListenersSettings.length; i < n; i++) {
            var settings = topicListenersSettings[i];
            var condition = settings.conditionForNotification;
            var el = <HTMLElement>(ev.target);
            console.log('ev.target.id = ' + el.id);
            var topicEvent: ITopicEvent = <ITopicEvent> settings;
            topicEvent.event = ev;
            if (!condition(topicEvent)) {
                delete topicEvent.event;
                continue;
            }
            var elX = tsp._.objectLookup[topicEvent.elXID];
            if (!elX) {
                delete topicEvent.event;
                continue; //todo:  remove topic handler
            }
            topicEvent.elX = elX;

            topicEvent.callback(topicEvent);
            delete topicEvent.elX;
            delete topicEvent.event;
        }
    }

    function ElementMatchesID(tEvent: ITopicEvent) {
        var el = <HTMLElement>(tEvent.event.target);
        return el.id === tEvent.elXID;
    }

    function SelectElementClickHandler(tEvent: ITopicEvent) {
        var elX = tEvent.elX;
        var ss = elX.bindInfo.selectSettings;
        //var ssss = ss.selectSet;
        var newVal = !elX.selected;
        var grp = ss.group ? ss.group : 'global';
        if (!ss) return;
        //if(ssss) ssss(newVal);

        clearSelections(grp, false);
        //tsp._.selectGroups[grp] = prevSelected;
        //elX.selected = newVal;
        if (newVal) { setSelection(grp, elX) }

    }

    export function addLocalEventListener(settings: IListenForTopic) {
        if (tsp._.runtimeEnvironment.environment === tsp._.EnvironmentOptions.WebServer) return;
        if (!settings.elX._rendered) {
            settings.elX.bindInfo.onNotifyAddedToDom = elX => {
                elX.el.attributes['data-tsp-evt-' + settings.topicName] = settings;
                elX.el.addEventListener(settings.topicName, localEventListener, false);
            }
        }
    }

    function localEventListener(ev: Event) {
        var el = <HTMLElement>(ev.target);
        var sTopic = ev.type;
        var settings = <IListenForTopic> el.attributes['data-tsp-evt-' + sTopic];
        var topicEvent: ITopicEvent = <ITopicEvent> settings;
        topicEvent.event = ev;
        topicEvent.elXID = el.id;
        var elX = tsp._.objectLookup[topicEvent.elXID];
        topicEvent.elX = elX;

        topicEvent.callback(topicEvent);

    }

    export function addWindowEventListener(settings: IListenForTopic) {
        if (tsp._.runtimeEnvironment.environment === tsp._.EnvironmentOptions.WebServer) return;
        var evtName = settings.topicName;
        var listeners = windowEventListeners[evtName];
        if (!listeners) {
            listeners = [];
            windowEventListeners[evtName] = listeners;
        }
        var condition = settings.conditionForNotification;

        if (!condition) {
            if (settings.elX) {
                settings.elXID = settings.elX.ID;
                delete settings.elX;
            }
            //condition = ElementMatchesID;
            settings.conditionForNotification = ElementMatchesID
        }
        //var listener = function (ev: Event) {
        //    var el = <HTMLElement>(ev.target);
        //    var topicEvent: ITopicEvent = <ITopicEvent> settings;
        //    topicEvent.event = ev;
        //    if(!condition(topicEvent)) return;
        //    var elX = objectLookup[topicEvent.elXID];
        //    if(!elX) return; //todo:  remove topic handler
        //    topicEvent.elX = elX;
        //    topicEvent.callback(topicEvent);
        //    delete topicEvent.elX;
        //}
        //listeners.push(listener);
        listeners.push(settings);
        window.addEventListener(evtName, windowEventListener);
        //window.addEventListener(settings.topicName, listener);
    }

    export class ElX implements IElX {

        constructor(public bindInfo: IDOMBinder) {
            if (!bindInfo.attributes) {
                bindInfo.attributes = {};
            }
            var id = bindInfo.id;
            if (!id) {
                id = tsp._.getUID();
            }
            this.bindInfo.attributes['ID'] = id;

            tsp._.objectLookup[id] = this;

            var da = bindInfo.dynamicAttributes;
            if (da) {
                for (var attribName in da) {
                    var dynA = da[attribName];
                    this.bindInfo.attributes[attribName] = dynA(this);
                }
            }
            var dc = bindInfo.dynamicClasses;
            if (dc) {
                for (var className in dc) {
                    var dynC = dc[className];
                    if (dynC(this)) {
                        this.ensureClass(className);
                    }
                }
            }
            if (bindInfo.classes) {
                bindInfo.attributes['class'] = bindInfo.classes.join(' ');
                delete bindInfo.classes;
            }
            var styles = bindInfo.styles;
            var ds = bindInfo.dynamicStyles;
            if (ds) {
                for (var styleName in ds) {
                    var dynS = ds[styleName];
                    if (!styles) {
                        styles = {};
                        bindInfo.styles = styles;
                    }
                    styles[styleName] = dynS(this);
                }
            }

            if (styles) {
                var style = '';
                for (var prop in styles) {
                    style += (prop + ':' + styles[prop] + ';');
                }
                bindInfo.attributes['style'] = style;
                delete bindInfo.styles;
            }


        }

        public ensureClass(className: string) {
            var bI = this.bindInfo;
            if (!this._rendered) {
                //TODO: untested code
                if (!bI.classes) bI.classes = [];
                var c = bI.classes;
                if (c.indexOf(className) != -1) return;
                c.push(className);
                return;
            }
            var el = this.el, cl = el.classList;
            if (cl) { cl.add(className); return; } else { backwardsComp.ensureClass(el, className); }

        }

        public hasClass(className: string): bool {
            var bI = this.bindInfo;
            if (!this._rendered) {
                //TODO: untested code
                if (!bI.classes) return false;
                var c = bI.classes;
                var i = c.indexOf(className);
                return (i != -1);
            }
            var cl = this.el.classList;
            return cl.contains(className);
        }

        public removeClass(className: string) {
            var bI = this.bindInfo;
            if (!this._rendered) {
                //TODO: untested code
                if (!bI.classes) return;
                var c = bI.classes;
                var i = c.indexOf(className);
                if (i == -1) return;
                c.splice(i, 1);
                return;
            }
            var cl = this.el.classList;
            if (cl) {
                this.el.classList.remove(className);
            } else {
                backwardsComp.removeClass(this.el, className);
            }
        }

        public doRender(context: RenderContext) {
            context.elements.push(this);
            var bI = this.bindInfo;
            if (bI.toggleKidsOnParentClick) {
                addWindowEventListener({
                    elX: this.parentElement,
                    topicName: 'click',
                    callback: ParentElementToggleClickHandler,
                });
            }
            var ss = bI.selectSettings;
            if (ss) {
                addWindowEventListener({
                    elX: this,
                    topicName: 'click',
                    callback: SelectElementClickHandler,
                });
                if (ss.selected) {
                    this.ensureClass(ss.selClassName ? ss.selClassName : 'selected');
                } else {
                    if (ss.unselClassName) this.ensureClass(ss.unselClassName);
                }
                //if (ss.selClassName) bI.attributes['data-selClassName'] = ss.selClassName;
                //if (ss.unselClassName) bI.attributes['data-unselClassName'] = ss.unselClassName;


            }
            context.output += '<' + bI.tag;
            var attribs = bI.attributes;
            for (var attrib in attribs) {
                context.output += ' ' + attrib + '="' + attribs[attrib] + '"';
            }
            var dynamicAttribs = bI.dynamicAttributes;
            if (dynamicAttribs) {
                for (var dynamicAttrib in dynamicAttribs) {
                    context.output += ' ' + dynamicAttrib + '="' + dynamicAttribs[dynamicAttrib](this) + '"';
                }
            }
            context.output += '>';
            if (bI.textGet) {
                context.output += bI.textGet(this);
            } else if (bI.text) {
                context.output += bI.text;
            }
            if (!bI.collapsed) {
                this.doInnerRender(context);
            }
            context.output += '</' + bI.tag + '>';
        }

        public doInnerRender(context: RenderContext) {
            var bI = this.bindInfo;

            var children = bI.kidsGet ? bI.kidsGet(this) : bI.kids;
            if (children) {
                if (!this._kidIds) this._kidIds = [];
                for (var i = 0, n = children.length; i < n; i++) {
                    var child = children[i];
                    child.parentElement = this;
                    child.doRender(context);
                    this._kidIds.push(child.ID);
                }
            }
            this._innerRendered = true;
        }

        public render(settings: IRenderContextProps) {
            var renderContext = new RenderContext(settings);
            var s = renderContext.settings;
            var target: HTMLElement;
            if (s.targetDom) {
                target = s.targetDom;
            } else {
                target = document.getElementById(renderContext.settings.targetDomID);
            }
            tsp._.cleanUp(target);
            this.doRender(renderContext);

            //clean up


            target.innerHTML = renderContext.output;
            var els = renderContext.elements;
            for (var i = els.length - 1; i > -1; i--) {
                var el = els[i];
                el.notifyAddedToDOM();
            }
            delete renderContext.elements;
            var s = renderContext.settings;
            delete s.targetDom;
        }

        public innerRender(settings: IRenderContextProps) {
            if (this._innerRendered) return;
            var renderContext = new RenderContext(settings);

            this.doInnerRender(renderContext);
            var target = this.el;

            target.innerHTML = renderContext.output;
            var els = renderContext.elements;
            for (var i = els.length - 1; i > -1; i--) {
                var el = els[i];
                el.notifyAddedToDOM();
            }
            this._innerRendered = true;
        }

        private _id: string;

        public get ID(): string {
            if (!this._rendered) return this.bindInfo.attributes['ID'];
            return this._id;
        }

        public get contentEditable(): string {
            if (this._rendered) {
                return this.el.contentEditable
            }
            return this.getAttr('contenteditable');
        }

        public set contentEditable(val: string) {

        }

        private _parentId: string;

        public get parentElement(): ElX {
            if (this._rendered) {
                var pd = this.parentDOM;
                return pd ? tsp._.objectLookup[pd.id] : null;
            };
            return tsp._.objectLookup[this._parentId];
        }

        public set parentElement(elem: ElX) {
            this._parentId = elem.ID;
        }

        public get parentDOM(): HTMLElement {
            var elD = this.el;
            return elD ? elD.parentElement : null;
        }

        private _kidIds: string[];

        public get kidElements(): ElX[] {
            var returnObj = [];
            if (this._rendered) {
                var children = this.childrenDOM;
                for (var child in children) {
                    var childDom = children[child];
                    var childEl = tsp._.objectLookup[childDom['id']];
                    if (childEl) returnObj.push(childEl);
                }
            } else if (this._kidIds) {
                for (var i = 0, n = this._kidIds.length; i < n; i++) {
                    var kidId = this._kidIds[i];
                    returnObj.push(tsp._.objectLookup[kidId]);
                }
            }
            return returnObj;
        }

        public get childrenDOM(): HTMLCollection {
            var elD = this.el;
            return elD ? elD.children : null;
        }

        public get selected(): bool {
            var ss = this.bindInfo.selectSettings;
            if (!ss) return false;
            var s = ss.selClassName ? ss.selClassName : 'selected';
            return this.hasClass(s);
        }

        public set selected(newVal?: bool) {
            var ss = this.bindInfo.selectSettings;
            if (!ss) return;
            var s = ss.selClassName ? ss.selClassName : 'selected';
            if (newVal === true) {
                this.ensureClass(s);
            } else {
                this.removeClass(s);
            }
            var ssss = ss.selectSet;
            if (ssss) ssss(this, newVal);
        }

        public _rendered: bool;
        private _innerRendered: bool;

        public notifyAddedToDOM() {
            this._rendered = true;
            var bI = this.bindInfo;
            this._id = bI.attributes['ID'];
            delete bI.attributes;
            if (!bI.collapsed) {
                delete this._parentId;
                delete this._kidIds;
            }
            delete this.parentElement;
            if (bI.onNotifyAddedToDom) {
                bI.onNotifyAddedToDom(this);
                delete bI.onNotifyAddedToDom;
            }
        }

        public getAttr(name: string): string {
            if (this._rendered) {
                var el = this.el;
                return el.getAttribute(name);
            }
            return this.bindInfo.attributes[name];
        }

        public setAttr(name: string, val: string) {
            if (this._rendered) {
                var el = this.el;
                el.setAttribute(name, val);
            }
            this.bindInfo.attributes[name] = val;
        }

        public removeAttr(name: string) {
            if (this._rendered) {
                var el = this.el;
                el.removeAttribute(name);
            } else {
                var attribs = this.bindInfo.attributes;
                delete attribs['checked'];
            }
        }


        public notifyTextChange(/*getter: tsp._.ISVGetter*/) {
            if (!this._rendered) return;
            var bI = this.bindInfo;
            if (!bI.textGet) return;
            var newVal = bI.textGet(this);
            var h: HTMLElement = this.el;
            if (h.innerHTML === newVal) return;
            h.innerHTML = newVal;
        }

        public notifyClassChange(className: string) {
            if (!this._rendered) return;
            var bI = this.bindInfo;
            var dynamicClass = bI.dynamicClasses[className];
            if (!dynamicClass) return;
            var newVal = dynamicClass(this);
            if (!newVal) {
                this.removeClass(className);
            } else {
                this.ensureClass(className);
            }
        }

        public notifyStyleChange(styleName: string) {
            if (!this._rendered) return;
            var bI = this.bindInfo;
            var dynamicStyle = bI.dynamicStyles[styleName];
            if (!dynamicStyle) return;
            var newVal = dynamicStyle(this);
            this.el.style[styleName] = newVal;
        }

        public notifyAttributeChange(attribName: string) {
            if (!this._rendered) return;
            var bI = this.bindInfo;
            var dynamicAttrib = bI.dynamicAttributes[attribName];
            if (!dynamicAttrib) return;
            var newVal = dynamicAttrib(this);
            this.el.setAttribute(attribName, newVal);
        }

        //public notifySPropChange(getter: tsp._.ISVGetter) {
        //    if(!this._rendered) return;
        //    var bI = this.bindInfo;
        //    if (!bI.dynamicAttributes) return;
        //    var propName = tsp._.getStringPropName(getter.getter);
        //    //might be mixing concepts here
        //    var elemPropGetter = bI.dynamicAttributes[propName];
        //    if (!elemPropGetter) return;
        //    var htmlElem = this.el;
        //    var sVal = elemPropGetter(this);
        //    if (htmlElem.attributes[propName] != sVal) {
        //        htmlElem.attributes[propName] = sVal;
        //    }
        //}

        //public notifyBPropChange(getter: tsp._.IBVGetter) {
        //}
        //Retrieves the associated dom element
        public get el(): HTMLElement {
            return document.getElementById(this._id);
        }
    }


    export class RenderContext implements IRenderContext {
        public output: string;
        public elements: ElX[];
        //public idStack: number[];

        constructor(public settings: IRenderContextProps) {
            //this.elemStack.push(settings.rootElement);
            this.output = "";
            this.elements = [];
            //this.idStack = []; 
        }
    }

    export function Div(bindInfo: IDOMBinder): ElX {
        bindInfo.tag = 'div';
        return new ElX(bindInfo);
    }

    export function Span(bindInfo: IDOMBinder): ElX {
        bindInfo.tag = 'span';
        return new ElX(bindInfo);
    }

    export function UL(bindInfo: IDOMBinder): ElX {
        bindInfo.tag = 'ul';
        return new ElX(bindInfo);
    }

    export function LI(bindInfo: IDOMBinder): ElX {
        bindInfo.tag = 'li';
        return new ElX(bindInfo);
    }



    export function THead(bindInfo: IDOMBinder): ElX {
        bindInfo.tag = 'thead';
        return new ElX(bindInfo);
    }

    export function TFoot(bindInfo: IDOMBinder): ElX {
        bindInfo.tag = 'tfoot';
        return new ElX(bindInfo);
    }

    export function TR(bindInfo: IDOMBinder): ElX {
        bindInfo.tag = 'tr';
        return new ElX(bindInfo);
    }
}