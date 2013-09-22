
interface JQueryStaticFacade {

    (el: Element): JQueryFacade;
    (selector: string): JQueryFacade;
    (): JQueryFacade;

    jQuery?: JQueryStaticFacade;
    trim(s: string): string;
    data(element: Element, key: string, value: any): any;
    //data(element: Element, key: string): any;
    //data(element: Element): any;
}

interface JQueryFacade {
    attr(name: string): string;
    attr(name: string, val: string): JQueryFacade;
    find(selector: string): JQueryFacade;
    html(): string;
    val(): any;
    trim(s: string): string;
    addClass(name: string): JQueryFacade;
    append($el: JQueryFacade): JQueryFacade;
    //data(key: string, value: any): JQuery;
    //data(obj: { [key: string]: any; }): JQuery;
    //data(key?: string): any;
    //data(): any;
    length: number;
    each(callback: (indexInArray: any, valueOfElement: any) => any): any;
}