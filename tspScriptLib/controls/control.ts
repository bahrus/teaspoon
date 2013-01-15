///<reference path="../ElX.ts" />

module tsp.controls {
    
    export interface IControlEvent {
        callback(ctl: Control);
    }

    export interface IControlSettings {
        onAfterInit?: IControlEvent[];
        onAfterAttachToDocument?: IControlEvent[];
        generateRootElement?(ctl: Control): tsp.ElX;
    }

    export class Control {

        constructor(public settings: IControlSettings) {
            
        }

        init(): void {
            this.rootElement = this.settings.generateRootElement(this);
            var initCallBacks = this.settings.onAfterInit;
            if (initCallBacks) {
                for (var i = 0, n = initCallBacks.length; i < n; i++) {
                    var cb = initCallBacks[i];
                    cb.callback(this);
                }
            }
        }


        public render(settings: tsp.IRenderContextProps) {
            this.init();
            this.rootElement.render(settings);
        }

        public rootElement: tsp.ElX;
    }
}