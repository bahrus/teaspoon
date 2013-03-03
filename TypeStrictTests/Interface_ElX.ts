module tsp {

    export interface IDOMBinder {

        attributes?: { [name: string]: string; };
        contentEditable?: bool;
        dynamicAttributes?: { [name: string]: { (el: IElX): string; }; };
        dynamicClasses?: { [name: string]: { (el: IElX): bool; }; };
        dynamicStyles?: { [name: string]: { (el: IElX): string; }; };
        b;
        classes?: string[];

        id?: string;

        kids?: IRenderable[];
        kidsGet?: (el: IElX)=> IElX[];

        styles?: { [name: string]: string; };

        tag?: string;
        //Inner Content - used if textGet is null
        text?: string;
        //Dynamic Inner Content
        textGet? (el: IElX): string;
        //child elements - used if kidsGet is null

        toggleKidsOnParentClick?: bool;
        collapsed?: bool;
        dataContext?: any;
        selectSettings?: ISelectBinder;
        container?: any;
        onNotifyAddedToDom?: (el: IElX) => any;
    }

    export interface IRenderable {
        parentElement: IRenderable;
        doRender(context: IRenderContext);
        ID: string;
    }

    export interface IElX extends IRenderable {
        bindInfo: IDOMBinder;
        //parentElement: IElX;
        //doRender(context: IRenderContext);
        //ID: string;
        el: HTMLElement;
        
        kidElements: IElX[];
        selected: bool;
        _rendered: bool;
        innerRender(settings: IRenderContextProps);
        removeClass(className: string);
        ensureClass(className: string);
    }

    export interface IRenderContext {
        output: string;
        elements: IElX[];
        settings: IRenderContextProps;
    }

    export interface ISelectBinder {
        //static 
        selected?: bool;
        //dynamic
        selectGet? (elX: IElX): bool;
        selectSet? (elX: IElX, newVal: bool): void;
        group?: string;
        selClassName?: string;
        partialSelClassName?: string;
        unselClassName?: string;
        conformWithParent?: bool;
    }

    export interface IListenForTopic {
        topicName: string;
        conditionForNotification? (tEvent: ITopicEvent): bool;
        callback(tEvent: ITopicEvent): void;
        /**
        element extension listening for the event
        */
        elX?: IElX;
        elXID?: string;
    }

    export interface ITopicEvent extends IListenForTopic {
        event: Event;
    }

    export interface IRenderContextProps {
        targetDomID?: string;
        targetDom?: HTMLElement;
    }
}