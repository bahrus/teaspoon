///<reference path="../Interface_ElX.ts" />
///<reference path="../ElX.ts" />

module tsp.controls {
    
    export interface IControlEvent {
        callback(ctl: Control);
    }

    export interface IControlSettings {
        onAfterInit?: IControlEvent[];
        onAfterAttachToDocument?: IControlEvent[];
        generateRootElement?(ctl: Control): tsp.ElX;
        id?: string;
    }

    export class Control implements IRenderable {

        parentElement: IRenderable;
        constructor(public settings: IControlSettings) {
            
        }
        private _initialized = false;
        init(): void {
            if(this._initialized) return;
            this.rootElement = this.settings.generateRootElement(this);
            var initCallBacks = this.settings.onAfterInit;
            if (initCallBacks) {
                for (var i = 0, n = initCallBacks.length; i < n; i++) {
                    var cb = initCallBacks[i];
                    cb.callback(this);
                }
            }
            this._initialized = true;
        }

        public doRender(context: RenderContext) {
            this.init();
            this.rootElement.doRender(context);
        } 
        public render(settings: tsp.IRenderContextProps) {
            this.init();
            this.rootElement.render(settings);
        }

        public rootElement: tsp.ElX;

        public get ID(): string {
            return this.rootElement.ID;
        }
    }
}