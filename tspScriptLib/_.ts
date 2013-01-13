

module tsp._ {
    export interface IEnvironment {
        environment: EnvironmentOptions;
    };

    export enum EnvironmentOptions {
        Browser,
        WebServer
    };
    
    export var runtimeEnvironment: IEnvironment = {
        environment: window.alert ? EnvironmentOptions.Browser : EnvironmentOptions.WebServer,
    };

        

    

    export interface ISetBoolValue extends IBVGetter {
        setter(obj: any, val: bool): void;
        getter(obj: any): bool;
        obj: any;
        val: bool;
    }

    export interface ISetStringValue extends ISVGetter{
        setter(obj: any, val: string): void;
        getter(obj: any): string;
        obj: any;
        val: string;
    }

    export interface IListenForStringValueChange extends ISVGetter{
        //getter(obj: any): string;
        obj: any;
        callback(newVal: string): void;
    }

    export interface IListenForBoolValueChange extends IBVGetter{
        //getter(obj: any): string;
        obj: any;
        callback(newVal: bool): void;
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
    
    export var objectLookup: { [name: string]: any; } = {};
    export var SVObjectChangeListeners: { [name: string]: { (newVal: string): void; }[]; } = {}; 
    export var BVObjectChangeListeners: { [name: string]: { (newVal: bool): void; }[]; } = {};
  
    
    export function getUID() : string {
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
        var all : any = d.all;
        if (!all) all = d.getElementsByTagName('*');
        
        for (var i = 0, n = all.length; i < n; i++) {
            var elT = <HTMLElement> all[i];
            var elX = objectLookup[elT.id];
            delete elX.kids;
            if (elT.id) delete objectLookup[elT.id];
        }
    }

    export function ListenForSVChange(listener : IListenForStringValueChange){
        var obj = listener.obj;
        var objId = GUID(obj);
        //next two lines repeat in setSV - common func?
        var propName = getStringPropName(listener.getter);
        var lID = objId + "." + propName;
        if (!SVObjectChangeListeners[lID]) SVObjectChangeListeners[lID] = [];
        SVObjectChangeListeners[lID].push(listener.callback);
    }

    export function ListenForBVChange(listener : IListenForBoolValueChange){
        var obj = listener.obj;
        var objId = GUID(obj);
        //next two lines repeat in setSV - common func?
        var propName = getBoolPropName(listener.getter);
        var lID = objId + "." + propName;
        if (!BVObjectChangeListeners[lID]) BVObjectChangeListeners[lID] = [];
        
        BVObjectChangeListeners[lID].push(listener.callback);
    }

    export function setBV(BVSetter: ISetBoolValue) {
        var obj = BVSetter.obj;
        BVSetter.setter(obj, BVSetter.val);
        if(obj.DhID){
            var propName = getBoolPropName(BVSetter.getter);
            var lID = obj.DhID + "." + propName;
            var listeners = BVObjectChangeListeners[lID];
            if(listeners){
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
        if(obj.DhID){
            var propName = getStringPropName(SVSetter.getter);
            var lID = obj.DhID + "." + propName;
            var listeners = SVObjectChangeListeners[lID];
            if(listeners){
                for (var i = 0, n = listeners.length; i < n; i++) {
                    var callback = listeners[i];
                    callback(SVSetter.val);
                }
            }
        }
        
    }
      
    export class betweenString {
        constructor (private val: string, private searchStart: string) {}

        public and(searchEnd: string): string {
            var posOfStart = this.val.indexOf(this.searchStart);
            if (posOfStart === -1) return '';
            var posOfEnd = this.val.indexOf(searchEnd, posOfStart);
            if (posOfEnd === -1) return this.val.substring(posOfStart);
            return this.val.substring(posOfStart + this.searchStart.length, posOfEnd);
        }
    }

    //export function update(

    export function getStringPropName(getter: { (newVal: any): string; }) : string {
        var s = getter.toString();
        //var s2 = s.substringBetween('.').and(';');
        var s2 = new _.betweenString(s, '.').and(';');
        return s2;
    }

    export function getBoolPropName(getter: { (newVal: any): bool; }) : string {
        var s = getter.toString();
        //var s2 = s.substringBetween('.').and(';');
        var s2 = new _.betweenString(s, '.').and(';');
        return s2;
    }
}