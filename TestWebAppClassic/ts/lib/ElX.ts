///<reference path="_.ts" />
///<reference path="Interface_ElX.ts" />
///<reference path="ie9.ts" />

module tsp {

    export class maps {

        static windowEventListeners: { [name: string]: IListenForTopic[]; } = {};
        static selectionChangeListeners: { [name: string]: { (); void; }[]; } = {};
        static selectGroups: { [name: string]: IElX[]; } = {};

        static getGlobalStorage() {
            return {
                objectLookup: tsp._.objectLookup,
                objectListeners: tsp._.SVObjectChangeListeners,
                windowEventListeners: maps.windowEventListeners,
                selectionChangeListeners: maps.selectionChangeListeners,
                selectGroups: maps.selectGroups,
            };
        }
    }

    export class SelectFns {
        static notifySelectionChange(name: string) {
            var scls = maps.selectionChangeListeners[name];
            if (!scls) return;
            for (var i = 0, n = scls.length; i < n; i++) {
                var scl = scls[i];
                scl();
            }
        }

        static getSelections(groupName: string) {
            return maps.selectGroups[groupName];
        }

        static clearSelections(groupName: string, notify: bool) {
            var sel = maps.selectGroups[groupName];
            if (!sel) return;
            for (var i = 0, n = sel.length; i < n; i++) {
                var other = sel[i];
                other.selected = false;
            }
            var sg = maps.selectGroups;
            delete sg[groupName];
            if (notify) {
                SelectFns.notifySelectionChange(groupName);
            }

        }

        static setSelection(groupName: string, elX: IElX) {
            SelectFns.clearSelections(groupName, false);
            SelectFns.addSelection(groupName, elX, true);
        }

        static addSelection(groupName: string, elX: IElX, notify: bool) {
            var sel = maps.selectGroups[groupName];
            if (!sel) { sel = []; maps.selectGroups[groupName] = sel; }
            elX.selected = true;
            sel.push(elX);
            if (notify) SelectFns.notifySelectionChange(groupName);
        }

        static removeSelection(groupName: string, elX: tsp.ElX, notify: bool) {
            var sel = maps.selectGroups[groupName];
            if (!sel) return;
            debugger;//TODO:  remove
        }

        static addSelectionChangeListener(name: string, callBack: () => void ) {
            var listeners = maps.selectionChangeListeners[name];
            if (!listeners) {
                listeners = [];
                maps.selectionChangeListeners[name] = listeners;
            }
            listeners.push(callBack);
        }
    }

    export class EventFns {
        static ParentElementToggleClickHandler(tEvent: ITopicEvent) {
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

        static windowEventListener(ev: Event) {
            var evtName = ev.type;
            var topicListenersSettings = maps.windowEventListeners[evtName];
            console.log('windowEventListener.evtName=' + evtName);
            if (!topicListenersSettings) return;
            for (var i = 0, n = topicListenersSettings.length; i < n; i++) {
                var settings = topicListenersSettings[i];
                var condition = settings.conditionForNotification;
                var el = <HTMLElement>(ev.target);
                console.log('ev.target.id = ' + el.id);
                var topicEvent: ITopicEvent = <ITopicEvent> settings;
                topicEvent.topicEvent = ev;
                if (!condition(topicEvent)) {
                    delete topicEvent.topicEvent;
                    continue;
                }
                var elX = tsp._.objectLookup[topicEvent.elXID];
                if (!elX) {
                    delete topicEvent.topicEvent;
                    continue; //todo:  remove topic handler
                }
                topicEvent.elX = elX;

                topicEvent.callback(topicEvent);
                delete topicEvent.elX;
                delete topicEvent.topicEvent;
            }
        }

        static ElementMatchesID(tEvent: ITopicEvent) {
            var el = <HTMLElement>(tEvent.topicEvent.target);
            return el.id === tEvent.elXID;
        }

        static SelectElementClickHandler(tEvent: ITopicEvent) {
            var elX = tEvent.elX;
            var ss = elX.bindInfo.selectSettings;
            //var ssss = ss.selectSet;
            var newVal = !elX.selected;
            var grp = ss.group ? ss.group : 'global';
            if (!ss) return;
            //if(ssss) ssss(newVal);

            SelectFns.clearSelections(grp, false);
            //tsp._.selectGroups[grp] = prevSelected;
            //elX.selected = newVal;
            if (newVal) { SelectFns.setSelection(grp, elX) }

        }

        static addLocalEventListener(settings: IListenForTopic) {
            if (tsp._.Environment.runtimeEnvironment.environment === tsp._.EnvironmentOptions.WebServer) return;
            if (!settings.elX._rendered) {
                settings.elX.bindInfo.onNotifyAddedToDom = elX => {
                    elX.el['data-tsp-evt-' + settings.topicName] = settings;
                    elX.el.addEventListener(settings.topicName, EventFns.localEventListener, false);
                }
            }
        }

        static localEventListener(ev: Event) {
            var el = <HTMLElement>(ev.target);
            var sTopic = ev.type;
            var settings = <IListenForTopic> el['data-tsp-evt-' + sTopic];
            var topicEvent: ITopicEvent = <ITopicEvent> settings;
            topicEvent.topicEvent = ev;
            topicEvent.elXID = el.id;
            var elX = tsp._.objectLookup[topicEvent.elXID];
            topicEvent.elX = elX;

            topicEvent.callback(topicEvent);

        }

        static addWindowEventListener(settings: IListenForTopic) {
            if (tsp._.Environment.runtimeEnvironment.environment === tsp._.EnvironmentOptions.WebServer) return;
            var evtName = settings.topicName;
            var listeners = maps.windowEventListeners[evtName];
            if (!listeners) {
                listeners = [];
                maps.windowEventListeners[evtName] = listeners;
            }
            var condition = settings.conditionForNotification;

            if (!condition) {
                if (settings.elX) {
                    settings.elXID = settings.elX.ID;
                    delete settings.elX;
                }
                //condition = ElementMatchesID;
                settings.conditionForNotification = EventFns.ElementMatchesID
            }
            
            listeners.push(settings);
            window.addEventListener(evtName, EventFns.windowEventListener);
        }
    }

    export class DElX<TObj> extends ElX implements IDElX<TObj> {
        constructor(public bindInfo: IDOM2WayBinder<TObj>) {
            super(bindInfo);
        }
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
                EventFns.addWindowEventListener({
                    elX: this.parentElement,
                    topicName: 'click',
                    callback: EventFns.ParentElementToggleClickHandler,
                });
            }
            var ss = bI.selectSettings;
            if (ss) {
                EventFns.addWindowEventListener({
                    elX: this,
                    topicName: 'click',
                    callback: EventFns.SelectElementClickHandler,
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

        public set selected(newVal: bool) {
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


        //Retrieves the associated dom element
        public get el(): HTMLElement {
            return document.getElementById(this._id);
        }

        //#region Element Shortcuts
        static Div(bindInfo: IDOMBinder): ElX {
            bindInfo.tag = 'div';
            return new ElX(bindInfo);
        }

        static Span(bindInfo: IDOMBinder): ElX {
            bindInfo.tag = 'span';
            return new ElX(bindInfo);
        }

        static UL(bindInfo: IDOMBinder): ElX {
            bindInfo.tag = 'ul';
            return new ElX(bindInfo);
        }

        static LI(bindInfo: IDOMBinder): ElX {
            bindInfo.tag = 'li';
            return new ElX(bindInfo);
        }

        static THead(bindInfo: IDOMBinder): ElX {
            bindInfo.tag = 'thead';
            return new ElX(bindInfo);
        }

        static TFoot(bindInfo: IDOMBinder): ElX {
            bindInfo.tag = 'tfoot';
            return new ElX(bindInfo);
        }

        static TR(bindInfo: IDOMBinder): ElX {
            bindInfo.tag = 'tr';
            return new ElX(bindInfo);
        }
        //#endregion
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


}