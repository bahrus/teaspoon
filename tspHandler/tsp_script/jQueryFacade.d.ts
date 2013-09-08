
interface JQueryStaticFacade {

    (el: HTMLElement): JQueryFacade;

    jQuery?: JQueryStaticFacade;
}

interface JQueryFacade {
    attr(name: string) : string;
    attr(name: string, val: string): JQueryFacade;
}