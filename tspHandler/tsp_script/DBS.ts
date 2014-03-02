module DBS {
    /**
    * Options for making client-side AJAX call to server side method of object of type TObj, where the server returns an object which, after serializing to JSON, is of type TReturn
    */
    export interface ICallOptions<TObj, TReturn> {
        /**
        * Name of server-side method
        */
        MethodName: string;
        /**
        * Optional list of parameters to send to server side method
        */
        Parameters?: IParameter[];
        /**
        * Optional call back function, which passes the JSON form of the return object of the method
        */
        CallbackFn?: (returnObj: TReturn) => void;
        /**
        * Optional options for how to modify the model branch
        */
        ObjectReplacementStrategy?: IReplacementStrategy<TObj>;
        /**
        * Optional function to filter model branch object before sending
        */
        FilterFn?: (obj: TObj) => TObj;
    }
    export interface IParameter {
        name: string;
        value: any;
    }
    export interface IReplacementStrategy<TObj> {
        /**
        * Optional function which previews new model branch oject returned from server.  
        * If function returns false, new object is discarded.
        */
        ValidatorFn?: (obj: TObj) => boolean;
        /**
        * Optional function which filters results before replacing model branch
        */
        FilterFn?: (obj: TObj) => TObj;
        /**
        * Optional parameter which specifies how the model branch returned from the AJAX call  should be integrated into the client-side model
        */
        ReplacementOption?: ReplacementOptions;
    }
    export enum ReplacementOptions {
        Replace,
        Append,
        Ignore,
    }

    export interface IStyleDirective {
        CSSRule: CSSRule;
        DocOrder: number;
        AttributeDirectives?: IStyleDirective[];
    }

    export interface IScriptDirective {
        scriptTag: HTMLScriptElement;
        targetElements: NodeList;
    }
} 