///<reference path='tsp.ts'/>
///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>

module tcp {

    var prefix = 'tcp-';

    export interface ICascadingHandler {
        selectorText: string;
        handler: (evt: Event, handler: ICascadingHandler) => void;
    }

    export interface IUIBindingInfo {
        propertyToMonitor?: string;
        subPropertyToMonitor?: string;
        form?: string;
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
        var sControlID = el.id + '_' + sPropertyName.replace('.', '_');
        
        var frms = br.form.split(' ');
        for (var i = 0, n = frms.length; i < n; i++) {
            var frmID = frms[i];
            var frm = $('#' + frmID);
            if (frm.length == 0) continue;
            var $inpFld = frm.find('.' + sControlID);
            if ($inpFld.length == 0) {
                frm.append($('<input/>').attr('type', 'hidden').attr('name', sControlID.replace('_value', '')).addClass(sControlID));
                $inpFld = frm.find('.' + sControlID);
            }
            $inpFld.val(elPropVal);
        }
        
    }

    var handlers: { [key: string]: ICascadingHandler[]; } = {};

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
        var el = evt.srcElement;
        var evtHandlers = handlers[evt.type];
        //var matchor = el['mozMatchesSelector'] || el['webkitMatchesSelector'] || el.msMatchesSelector;
         
        for (var i = 0, n = evtHandlers.length; i < n; i++) {
            var evtHandler = evtHandlers[i];
            var doesMatch = false;
            if (el.msMatchesSelector) {
                doesMatch = el.msMatchesSelector(evtHandler.selectorText);
            } else{//need to test other browsers with native support
                doesMatch = matchesSelector(el, evtHandler.selectorText);
            }
            if (doesMatch) {
                evtHandler.handler(evt, evtHandler);
            }
        }
    } 

    export function _when(eventName: string, cascadingHandler: ICascadingHandler) {
        
        var eventHandlers = handlers[eventName];
        if (!eventHandlers) {
            eventHandlers = [];
            handlers[eventName] = eventHandlers;
            var body = document.body;
           
            if (body.attachEvent) {
                body.attachEvent('on' + eventName, handleCascadingEvent);
            } else {
                body.addEventListener(eventName, handleCascadingEvent);
            }
        }
        eventHandlers[eventHandlers.length] = cascadingHandler;
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
}