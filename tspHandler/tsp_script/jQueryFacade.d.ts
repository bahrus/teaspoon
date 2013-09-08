
interface JQueryStaticFacade {

    (el: HTMLElement): JQueryFacade;
    (selector: string): JQueryFacade;

    jQuery?: JQueryStaticFacade;
}

interface JQueryFacade {
    attr(name: string) : string;
    attr(name: string, val: string): JQueryFacade;
}