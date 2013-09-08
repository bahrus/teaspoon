///<reference path='tsp.ts'/>
///<reference path='../Scripts/typings/jquery/jquery.d.ts'/>

module tcp {

    var handlers: { [key: string]: tsp.ICascadingHandler[]; } = {};

    function handleCascadingEvent(evt: Event) {
        
    } 

    export function _when(eventName: string, cascadingHandler: tsp.ICascadingHandler) {
        
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