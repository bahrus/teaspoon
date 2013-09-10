
interface JQueryStaticFacade {

    (el: HTMLElement): JQueryFacade;
    (selector: string): JQueryFacade;
    (): JQueryFacade;

    jQuery?: JQueryStaticFacade;
    trim(s: string): string;
}

interface JQueryFacade {
    attr(name: string): string;
    attr(name: string, val: string): JQueryFacade;
    html(): string;
    val(): any;
    trim(s: string): string;
    length: number;
    each(callback: (indexInArray: any, valueOfElement: any) => any): any;
}