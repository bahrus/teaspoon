module tsp._ {
    export interface IEnvironment {
        environment: EnvironmentOptions;
    };

    export enum EnvironmentOptions {
        Browser,
        WebServer
    };

    export class Environment {
        public static runtimeEnvironment: IEnvironment = {
            environment: window.alert ? EnvironmentOptions.Browser : EnvironmentOptions.WebServer,
        };

        public static BrowserDetect: IBrowserInfo = {
            init: function () {
                this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
                this.version = this.searchVersion(navigator.userAgent)
                    || this.searchVersion(navigator.appVersion)
                    || "an unknown version";
                this.OS = this.searchString(this.dataOS) || "an unknown OS";
            },
            searchString: function (data: IBrowserType[]) {
                for (var i = 0; i < data.length; i++) {
                    var dataString = data[i].string;
                    var dataProp = data[i]['prop'];
                    this.versionSearchString = data[i].versionSearch || data[i].identity;
                    if (dataString) {
                        if (dataString.indexOf(data[i].subString) != -1)
                            return data[i].identity;
                    }
                    else if (dataProp)
                        return data[i].identity;
                }
            },
            searchVersion: function (dataString) {
                var index = dataString.indexOf(this.versionSearchString);
                if (index == -1) return;
                return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
            },
            dataBrowser: [
                //#region
                {
                    string: navigator.userAgent,
                    subString: "Chrome",
                    identity: "Chrome"
                },
                {
                    string: navigator.userAgent,
                    subString: "OmniWeb",
                    versionSearch: "OmniWeb/",
                    identity: "OmniWeb"
                },
                {
                    string: navigator['vendor'],
                    subString: "Apple",
                    identity: "Safari",
                    versionSearch: "Version"
                },
                {
                    prop: window['opera'],
                    identity: "Opera",
                    versionSearch: "Version"
                },
                {
                    string: navigator['vendor'],
                    subString: "iCab",
                    identity: "iCab"
                },
                {
                    string: navigator['vendor'],
                    subString: "KDE",
                    identity: "Konqueror"
                },
                {
                    string: navigator.userAgent,
                    subString: "Firefox",
                    identity: "Firefox"
                },
                {
                    string: navigator['vendor'],
                    subString: "Camino",
                    identity: "Camino"
                },
                {		// for newer Netscapes (6+)
                    string: navigator.userAgent,
                    subString: "Netscape",
                    identity: "Netscape"
                },
                {
                    string: navigator.userAgent,
                    subString: "MSIE",
                    identity: "Explorer",
                    versionSearch: "MSIE"
                },
                {
                    string: navigator.userAgent,
                    subString: "Gecko",
                    identity: "Mozilla",
                    versionSearch: "rv"
                },
                { 		// for older Netscapes (4-)
                    string: navigator.userAgent,
                    subString: "Mozilla",
                    identity: "Netscape",
                    versionSearch: "Mozilla"
                }
                //#endregion
            ],
            dataOS: [
                {
                    string: navigator.platform,
                    subString: "Win",
                    identity: "Windows"
                },
                {
                    string: navigator.platform,
                    subString: "Mac",
                    identity: "Mac"
                },
                {
                    string: navigator.userAgent,
                    subString: "iPhone",
                    identity: "iPhone/iPod"
                },
                {
                    string: navigator.platform,
                    subString: "Linux",
                    identity: "Linux"
                }
            ]

        };
    }

     

    export interface IBrowserInfo {
        browser?: string;
        version?: string;
        OS?: string;
        dataBrowser: IBrowserType[];
        init(): void;
    };

    export interface IBrowserType {
        string?: string;
        subString?: string;
        identity: string;
        versionSearch?: string;
    }

    //#if CompileToJS
    Environment.BrowserDetect.init();
    //#endif



    export interface ISetBoolValue extends IBVGetter {
        setter(obj: any, val: bool): void;
        getter(obj: any): bool;
        obj: any;
        val: bool;
    }

    export interface ISetStringValue extends ISVGetter {
        setter(obj: any, val: string): void;
        getter(obj: any): string;
        obj: any;
        val: string;
    }

    export interface ISetNumValue extends INVGetter {
        setter(obj: any, val: number): void;
        getter(obj: any): number;
        obj: any;
        val: number;
    }

    export interface IListenForStringValueChange extends ISVGetter {
        //getter(obj: any): string;
        obj: any;
        callback(newVal: string): void;
    }

    export interface IListenForBoolValueChange extends IBVGetter {
        //getter(obj: any): string;
        obj: any;
        callback(newVal: bool): void;
    }

    export interface IListenForNumericValueChange extends INVGetter {
        obj: any;
        callback(newVal: number): void;
    }

    export interface IListenForSelectionChange {
        groupName: string;
        callback(): void;
    }



    export interface ISVGetter {
        getter(obj: any): string;
    }

    export interface IBVGetter {
        getter(obj: any): bool;
    }

    export interface INVGetter {
        getter(obj: any): number;
    }

    export var objectLookup: { [name: string]: any; } = {};
    export var SVObjectChangeListeners: { [name: string]: { (newVal: string): void; }[]; } = {};
    export var BVObjectChangeListeners: { [name: string]: { (newVal: bool): void; }[]; } = {};
    export var NVObjectChangeListeners: { [name: string]: { (newVal: number): void; }[]; } = {};

    export function getUID(): string {
        counter++;
        return "Dh_" + counter;
    }
    var counter: number = 0;

    export function GUID(obj: any): string {
        var id = obj.DhID;
        if (!id) {
            id = getUID();
            obj.DhID = id;
            objectLookup[id] = obj;
        }
        return id;
    }

    export function cleanUp(d: HTMLElement) {
        var all: any = d.all;
        if (!all) all = d.getElementsByTagName('*');

        for (var i = 0, n = all.length; i < n; i++) {
            var elT = <HTMLElement> all[i];
            var elX = objectLookup[elT.id];
            delete elX.kids;
            if (elT.id) delete objectLookup[elT.id];
        }
    }

    export function ListenForSVChange(listener: IListenForStringValueChange) {
        var obj = listener.obj;
        var objId = GUID(obj);
        //next two lines repeat in setSV - common func?
        var propName = getStringPropName(listener.getter);
        var lID = objId + "." + propName;
        if (!SVObjectChangeListeners[lID]) SVObjectChangeListeners[lID] = [];
        SVObjectChangeListeners[lID].push(listener.callback);
    }

    export function ListenForBVChange(listener: IListenForBoolValueChange) {
        var obj = listener.obj;
        var objId = GUID(obj);
        //next two lines repeat in setSV - common func?
        var propName = getBoolPropName(listener.getter);
        var lID = objId + "." + propName;
        if (!BVObjectChangeListeners[lID]) BVObjectChangeListeners[lID] = [];

        BVObjectChangeListeners[lID].push(listener.callback);
    }

    export function ListenForNVChange(listener: IListenForNumericValueChange) {
        var obj = listener.obj;
        var objId = GUID(obj);
        //next two lines repeat in setSV - common func?
        var propName = getNumericPropName(listener.getter);
        var lID = objId + "." + propName;
        if (!NVObjectChangeListeners[lID]) NVObjectChangeListeners[lID] = [];

        NVObjectChangeListeners[lID].push(listener.callback);
    }

    export function setBV(BVSetter: ISetBoolValue) {
        var obj = BVSetter.obj;
        BVSetter.setter(obj, BVSetter.val);
        if (obj.DhID) {
            var propName = getBoolPropName(BVSetter.getter);
            var lID = obj.DhID + "." + propName;
            var listeners = BVObjectChangeListeners[lID];
            if (listeners) {
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var callback = listeners[i];
                    callback(BVSetter.val);
                }
            }
        }
    }

    export function setSV(SVSetter: ISetStringValue) {
        var obj = SVSetter.obj;
        SVSetter.setter(obj, SVSetter.val);
        if (obj.DhID) {
            var propName = getStringPropName(SVSetter.getter);
            var lID = obj.DhID + "." + propName;
            var listeners = SVObjectChangeListeners[lID];
            if (listeners) {
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var callback = listeners[i];
                    callback(SVSetter.val);
                }
            }
        }

    }

    export function setNV(NVSetter: ISetNumValue) {
        var obj = NVSetter.obj;
        NVSetter.setter(obj, NVSetter.val);
        if (obj.DhID) {
            var propName = getNumericPropName(NVSetter.getter);
            var lID = obj.DhID + "." + propName;
            var listeners = NVObjectChangeListeners[lID];
            if (listeners) {
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var callback = listeners[i];
                    callback(NVSetter.val);
                }
            }
        }
    }

    export class betweenString {
        constructor(private val: string, private searchStart: string) { }

        public and(searchEnd: string): string {
            var posOfStart = this.val.indexOf(this.searchStart);
            if (posOfStart === -1) return '';
            var posOfEnd = this.val.indexOf(searchEnd, posOfStart);
            if (posOfEnd === -1) return this.val.substring(posOfStart);
            return this.val.substring(posOfStart + this.searchStart.length, posOfEnd);
        }
    }

    //export function update(

    export function getStringPropName(getter: { (newVal: any): string; }): string {
        var s = getter.toString();
        var s2 = new _.betweenString(s, '.').and(';');
        return s2;
    }

    export function getBoolPropName(getter: { (newVal: any): bool; }): string {
        var s = getter.toString();
        var s2 = new _.betweenString(s, '.').and(';');
        return s2;
    }

    export function getNumericPropName(getter: { (newVal: any): number; }): string {
        var s = getter.toString();
        var s2 = new _.betweenString(s, '.').and(';');
        return s2;
    }
}