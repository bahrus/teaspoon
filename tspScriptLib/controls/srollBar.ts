///<reference path="control.ts" />

module tsp.controls {
    export interface IScrollBarRangeSettings extends tsp.controls.IControlSettings {
        maxValue: number;
        maxValueGetter?(): number;
        maxRemainder?: number;
        height: number;
    }

    

    export class VScrollBarRange extends tsp.controls.Control {

        static generateElement(vsbr: VScrollBarRange): tsp.ElX {
        var browser = 'ie';
        var settings = vsbr.VScrollBarSettings;
        switch (browser) {
            case 'ie':
                vsbr.BrowserSpecificMaxValueWithoutScaling = 25000;
                vsbr.BrowserSpecificIncrement = 50;
                vsbr.HeightMultiplicationFactor = settings.height / 22;
                break;
            case 'firefox':
                vsbr.BrowserSpecificMaxValueWithoutScaling = 900000;
                vsbr.BrowserSpecificIncrement = 19;
                vsbr.HeightMultiplicationFactor = settings.height / 8.1;
                break;
            default:

            }
        var numberOfRecordsToLeaveForLastPage = 0;
        if (settings.maxRemainder != null) {
            numberOfRecordsToLeaveForLastPage = settings.maxRemainder;
        }
        //var innerDivHeight = (int)(((int)this.MaxValue - numberOfRecordsToLeaveForLastPage) * this.HeightMultiplicationFactor + this.Dimensions.Height);
        var innerDivHeight = Math.floor((settings.maxValue - numberOfRecordsToLeaveForLastPage) * vsbr.HeightMultiplicationFactor + settings.height);
        if (settings.maxValue > vsbr.BrowserSpecificMaxValueWithoutScaling) {
            vsbr.IsMaxedOut = true;
            innerDivHeight = Math.min(innerDivHeight, vsbr.BrowserSpecificMaxValueWithoutScaling);

        }
        var _ = tsp, Div = _.Div;


        return Div({
            kids: [
                Div({
                    styles: { 'height': innerDivHeight + 'px' }
                }),
            ],
            styles: {
                'height' : vsbr.VScrollBarSettings.height + 'px',
                'overflow-y': 'scroll',
                'width' : '18px',
            },
        });
    }

        private HeightMultiplicationFactor: number;
        private BrowserSpecificMaxValueWithoutScaling: number;
        private IgnoreScrollEvent: number;
        private IsMaxedOut: bool;
        private BrowserSpecificIncrement: number;
        private Offset : number;
        private PreviousValue: number;
        private PreviousScrollTop : number;
        //public InnerDiv: DOM.ElX;

        constructor(public VScrollBarSettings: IScrollBarRangeSettings) {
            super(VScrollBarSettings);
            
            if (!VScrollBarSettings.generateRootElement) {
                VScrollBarSettings.generateRootElement = VScrollBarRange.generateElement;
            }
            //this.InnerDiv = Div({});
        }
        
    }
}