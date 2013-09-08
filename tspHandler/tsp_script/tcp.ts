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
}