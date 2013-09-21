///<reference path='tsp.ts'/>
///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='../Scripts/typings/jqueryui/jqueryui.d.ts'/>

module tcp {

    var prefix = 'tcp-';

    export interface ICascadingHandler {
        selectorNodeTest?: string;
        handler: (evt: Event, cascadingHandlerInfo: ICascadingHandler) => void;
        //test?: (el: HTMLElement) => boolean;
        containerID?: string;
        container?: HTMLElement;
        data?: any;
    }

    export interface IUIBindingInfo {
        propertyToMonitor?: string;
        subPropertyToMonitor?: string;
        //form?: string;
        ignoreIfFormAttrSupport?: boolean;
    }

    export function createBindingRule(bindingRule: IUIBindingInfo) {
        var bindingObj = tsp.beginMerge<IUIBindingInfo>({
            call: applyBindingRule,
            prefix: prefix,
            options: bindingRule,
        });
        return bindingObj;
    }

    export function addVScroller(el: HTMLElement, dt: tsp.IDataTable, rowOffset: HTMLInputElement) {
        var slider = $("<div id='slider'></div>").insertAfter(el).slider({
            min: 1,
            max: dt.data.length,
            range: "min",
            value: 0,
            slide: function (event, ui) {
                rowOffset.setAttribute('value', '' + (ui.value - 1));
                tsp.refreshTemplateWithRectCoords(el);
            }
        });
    }

    function handleRowSelection(evt: Event, cascadeInfo: ICascadingHandler) {
        var $el = $('#' + cascadeInfo.containerID);
        var sel = evt.srcElement, $sel = $(sel);
        var selRowsInp = <HTMLInputElement> document.getElementById(cascadeInfo.containerID + '_selectedRows');
        var selRows = selRowsInp.value.split(',');
        for (var i = 0, n = selRows.length; i < n; i++) {
            var selRow = selRows[i];
            $el.find('[data-rc^="' + selRow + ',"]').css('backgroundColor', 'white');
        }
        var r = $sel.attr('data-rc').split(',')[0];
        selRowsInp.value = r;
        $el.find('[data-rc^="' + r + ',"]').css('backgroundColor', 'blue');
        
    }

    export function addRowSelection(el: HTMLElement) {
        var sID = el.id;
        _when('click', {
            containerID : el.id,
            handler: handleRowSelection,
            selectorNodeTest: '*[data-rc]',
        });
    }


    export function applyBindingRule(el: HTMLElement, props: { [key: string]: any; }) {
        var bindingRule = <IUIBindingInfo> tsp.evalRulesSubset(props, prefix);
        if (bindingRule.ignoreIfFormAttrSupport) {
            if (testInputFormSupport()) return;
        }
        $.data(el).bindingRule = bindingRule;
        if (el.attachEvent) {
            el.attachEvent('onpropertychange', handleBindingChange);
        }
        
    }

    function handleBindingChange(ev: Event) {
        var el = <HTMLElement> ev.srcElement, elPropVal;
        var br = <IUIBindingInfo> $.data(el).bindingRule;
        var sPropertyName = br.propertyToMonitor;
        elPropVal = el[sPropertyName];
        if (br.subPropertyToMonitor) {
            sPropertyName += '.' + br.subPropertyToMonitor;
            elPropVal = elPropVal[br.subPropertyToMonitor];
        }
        if (ev['propertyName'] !== sPropertyName) return;
        var sName = el.getAttribute('name');
        if (!sName) sName = el.id; 
        var sControlID = sName + '_' + sPropertyName.replace('.', '_');
        tsp.data(el).shadowElClass = sControlID;
        //var frms = br.form.split(' ');
        var frms = el.getAttribute('form').split(' ');
        for (var i = 0, n = frms.length; i < n; i++) {
            var frmID = frms[i];
            var frm = $('#' + frmID);
            if (frm.length == 0) continue;
            var $inpFld = frm.find('.' + sControlID);
            if ($inpFld.length == 0) {
                frm.append($('<input/>').attr('type', 'hidden').attr('name', sControlID.replace('_value', '')).addClass(sControlID).addClass(el.className));
                $inpFld = frm.find('.' + sControlID);
            }
            $inpFld.val(elPropVal);
        }
        
    }

    //var handlers: { [key: string]: ICascadingHandler[]; } = {};

    var matchesSelector = function (node, selector) {
        var nodeList = node.parentNode.querySelectorAll(selector),
            length = nodeList.length,
            i = 0;
        while (i < length) {
            if (nodeList[i] == node) return true;
            ++i;
        }
        return false;
    };

    var _supportsTestFormAttribute = -1;

    function testInputFormSupport() {
        if (_supportsTestFormAttribute != -1) return _supportsTestFormAttribute != 0;
        var input = document.createElement('input'),
            form = document.createElement('form'),
            formId = 'test-input-form-reference-support';
        // Id of the remote form
        form.id = formId;
        // Add form and input to DOM
        document.body.appendChild(form);
        document.body.appendChild(input);
        // Add reference of form to input
        input.setAttribute('form', formId);
        // Check if reference exists
        var res = !(input.form == null);
        // Remove elements
        document.body.removeChild(form);
        document.body.removeChild(input);
        _supportsTestFormAttribute = res ? 1 : 0;
        return res;
    }
    

    function handleCascadingEvent(evt: Event) {
        var el = <HTMLElement> evt.srcElement;
        var evtEl = el;
        while (el) {
            var bCheckedBody = (el.tagName == 'BODY');
            var test = el.getAttribute(tsp.dataExpando);
            if (test) {
                var evtHandlers = tsp.data(el).handlers;
                if (evtHandlers) {
                    var evtHandler = evtHandlers[evt.type];
                    if (evtHandler) {
                        for (var i = 0, n = evtHandler.length; i < n; i++) {
                            var cascadeHandler = evtHandler[i];
                            var doesMatch = false;
                            if (cascadeHandler.selectorNodeTest) {
                                //var matchor = el['mozMatchesSelector'] || el['webkitMatchesSelector'] || el.msMatchesSelector;
                                if (evtEl.msMatchesSelector) {
                                    doesMatch = evtEl.msMatchesSelector(cascadeHandler.selectorNodeTest);
                                } else {//need to test other browsers with native support
                                    doesMatch = matchesSelector(evtEl, cascadeHandler.selectorNodeTest);
                                }
                            }
                            if (doesMatch) {
                                cascadeHandler.handler(evt, cascadeHandler);
                                return;
                            }
                        }
                    }
                }
            }
            el = <HTMLElement> el.parentNode;
            if (bCheckedBody) return;
        }
        
        
    } 

    export function _when(eventName: string, cascadingHandler: ICascadingHandler) {
        var el: HTMLElement;
        if (cascadingHandler.containerID) {
            el = document.getElementById(cascadingHandler.containerID);
        } else if (cascadingHandler.container) {
            el = cascadingHandler.container;
        }  else {
            el = document.body;
        }
        //var eventHandlers = handlers[eventName];
        var eventHandlers: { [key: string]: ICascadingHandler[]; }  = tsp.data(el).handlers;
        if (!eventHandlers) {
            eventHandlers = {};
            tsp.data(el).handlers = eventHandlers;
        }
        var eventHandler = eventHandlers[eventName];
        if (!eventHandler) {
            eventHandler = [];
            eventHandlers[eventName] = eventHandler;
            if (el.attachEvent) {
                el.attachEvent('on' + eventName, handleCascadingEvent);
            } else {
                el.addEventListener(eventName, handleCascadingEvent);
            }
        }
        eventHandler[eventHandler.length] = cascadingHandler;
    }

    export function handleTextFilterChange(evt: Event, cascHandler: tcp.ICascadingHandler) {
        var el = <HTMLInputElement> evt.srcElement;
        var oldValue = <string> tsp.data(el).oldValue;
        var newValue = el.value;
        if (oldValue == newValue) return;
        tsp.data(el).oldValue = el.value;
        var filterOptions = <tsp.IFilterOptions> tsp.evalRulesSubset( tsp.data(el).tsp, tsp.prefix);
        var shadowClass = tsp.data(el).shadowElClass;
        var shadowEls = document.querySelectorAll('.' + shadowClass);
        for (var i = 0, n = shadowEls.length; i < n; i++) {
            tsp.data(<HTMLElement> shadowEls[i]).filterOptions = filterOptions;
        }
        var elIDTokens = el.name.split('_');
        var templ = document.getElementById(elIDTokens[0]);
        var rule = <tsp.IPopulateRectCoordinates> tsp.data(templ).populateRule;
        
        if (!oldValue || (newValue.length > oldValue.length && newValue.substr(0, oldValue.length) == oldValue)) {
            tsp.filterColumn(rule.getDataTable(templ), parseInt(elIDTokens[3]) - 1, el.value);
        } else {
            tsp.applyAllFilters(templ, rule);
        }
        tsp.refreshTemplateWithRectCoords(templ);
    }
    

    export function handleOnPropertyChange(ev: Event) {
        if (ev['propertyName'] !== 'style.display') return;
        handleStyleDisplayChangeEventForLazyLoadedElement(<HTMLElement> ev.srcElement);
    }

    export function handleStyleDisplayChangeEventForLazyLoadedElement(el: HTMLElement) {
        var $el = $(el);
        //var sNewValue = el.style.display;
        var sNewValue = $el.css('display');
        var sOldValue = $.data(el).tsp_display;
        if (!sOldValue) sOldValue = 'none';
        if (sNewValue == sOldValue) return;
        if (el.detachEvent) {
            el.detachEvent('onpropertychange', handleOnPropertyChange);
        }
        $.data(el).tsp_display = sNewValue;
        if (!$.data(el).tsp_lazyloaded && (sNewValue !== 'none')) {
            var content = $.trim($el.html());
            el.insertAdjacentHTML('beforebegin', content);
        }
        var newElement = (<HTMLElement> el.previousSibling);
        newElement.style.display = sNewValue;
        newElement.id = newElement.getAttribute('data-originalID');
        el.parentNode.removeChild(el);
    }

    export function performReservedRules(doc: HTMLDocument) {
        var nds = doc.querySelectorAll('.' + tsp.reserved_lazyLoad);
        for (var j = 0, n = nds.length; j < n; j++) {
            var nd = <HTMLElement> nds[j];
            if (typeof (MutationObserver) !== 'undefined') {
                //var observer = new MutationObserver( (mrs : MutationRecord[]) => {
                //    // Handle mutations
                //    for (var i = 0, n = mrs.length; i < n; i++) {
                //        var mr = mrs[i];
                //        if (mr.attributeName !== 'style') continue;

                //        handleStyleDisplayChangeEventForLazyLoadedElement(<HTMLElement> mr.target);
                //        break;
                //    }
                //});
                //observer.observe(el, {  
                //    attributes: true,
                //});
            } else if (nd.attachEvent) {
                //TODO:  deprecate eventually - ie 10 and earlier
                nd.attachEvent('onpropertychange', tcp.handleOnPropertyChange);
            }
        }
    }
}

tsp._if('input[form]',
    tcp.createBindingRule({
        ignoreIfFormAttrSupport: true,
        propertyToMonitor: 'value',
    }).mergedObject
);