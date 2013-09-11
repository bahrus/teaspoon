///<reference path='tsp.ts'/>
///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>

module tcp {

    export interface ICascadingHandler {
        selectorText: string;
        handler: (evt: Event, handler: ICascadingHandler) => void;
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
        var sOldValue = tsp.data(el).tsp_display;
        if (!sOldValue) sOldValue = 'none';
        if (sNewValue == sOldValue) return;
        if (el.detachEvent) {
            el.detachEvent('onpropertychange', handleOnPropertyChange);
        }
        tsp.data(el).tsp_display = sNewValue;
        if (!tsp.data(el).tsp_lazyloaded && (sNewValue !== 'none')) {
            var content = $.trim($el.html());
            el.insertAdjacentHTML('beforebegin', content);
        }
        var newElement = (<HTMLElement> el.previousSibling);
        newElement.style.display = sNewValue;
        newElement.id = newElement.getAttribute('data-originalID');
        el.parentNode.removeChild(el);
    }
}