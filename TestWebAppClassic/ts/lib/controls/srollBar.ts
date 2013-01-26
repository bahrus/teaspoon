///<reference path="../ElX.ts" />
///<reference path="control.ts" />
 
module tsp.controls {
    export interface IVScrollBarRangeSettings extends tsp.controls.IControlSettings {
        maxValue: number;
        maxValueGetter?(): number;
        maxRemainder?: number;
        height: number;
        scrollValueGet? (v: VScrollBarRange): number;
        scrollValueSet? (v: VScrollBarRange, val: number): number;
    }

    function VScrollBarScrollHandler(tEvent: ITopicEvent){
        var outerDivElX = tEvent.elX;
        var vsbr = <VScrollBarRange> outerDivElX.bindInfo.container;
        var scrollTop: number = outerDivElX.el.scrollTop;
        if (!vsbr.IsMaxedOut) {
            var scrollValue = Math.floor(scrollTop / vsbr.HeightMultiplicationFactor);
            var testValue = scrollTop / vsbr.VScrollBarSettings.height;
            vsbr.VScrollBarSettings.scrollValueSet(vsbr, scrollValue);
            return;
        }
        /*
        #region Maxed Out
        if (Math.Abs(scrollTop - this.PreviousScrollTop) < this.BrowserSpecificIncrement) {
            ScrollValue = this.PreviousValue;
            return;
        }
        #region change larger than 50

        if (scrollTop - this.PreviousScrollTop == this.BrowserSpecificIncrement) {
            #region Went Down by One
            if (this.PreviousScrollTop == 0d) {
                this.Offset = 1 - (int) this.BrowserSpecificIncrement;
                this.PreviousValue = 1;
                this.PreviousScrollTop = scrollTop;
                ScrollValue = this.PreviousValue;
                return;
            }
            #region Not at the top
            if (this.Offset >= 0) {
                #region Let the scrolling happen
                this.PreviousScrollTop = scrollTop;
                this.Offset = 1 - (int) this.BrowserSpecificIncrement;
                this.PreviousValue++;
                ScrollValue = this.PreviousValue;
                return;
                #endregion
            }
            #region Keep Scrollbar where it is
            this.Offset++;
            this.PreviousValue++;
            this.IgnoreScrollEvent = true;
            scrollTop = this.PreviousScrollTop;
            this.HtmlElement.SetProperty(Element.AttributeNames.scrollTop, scrollTop);
            return;
            #endregion
            #endregion
            #endregion
        }
        else if (scrollTop - this.PreviousScrollTop == -this.BrowserSpecificIncrement) {
            #region Went Up By One
            if (this.PreviousScrollTop == 24600d)
            {
                this.Offset = (int) this.BrowserSpecificIncrement - 1;
                this.PreviousValue = this.MaxValue - 1;
                this.PreviousScrollTop = scrollTop;
                ScrollValue = this.PreviousValue;
                return;
            }
            #region Not At the bottom
            if (this.Offset <= 0) {
                #region Let the scrolling happen
                this.PreviousScrollTop = scrollTop;
                this.Offset = (int) this.BrowserSpecificIncrement - 1;
                this.PreviousValue--;
                ScrollValue = this.PreviousValue;
                return;
                #endregion
            }
            #region Keep Scrollbar where it is
            this.Offset--;
            this.PreviousValue--;
            this.IgnoreScrollEvent = true;
            scrollTop = this.PreviousScrollTop;
            this.HtmlElement.SetProperty(Element.AttributeNames.scrollTop, scrollTop);
            return;
            #endregion
            #endregion
            #endregion

        }



        int ubound = (int) Math.Ceiling(scrollTop * this.MaxValue / (this.InnerDiv.DimensionsNN.Height - 400));
        int lbound = (int) Math.Floor(scrollTop * this.MaxValue / (this.InnerDiv.DimensionsNN.Height - 400));
        Debug.WriteLine("scrollTop = " + scrollTop);
        Debug.WriteLine("lbound = " + lbound);
        Debug.WriteLine("ubound = " + ubound);
        this.PreviousValue = ubound;
        this.PreviousScrollTop = scrollTop;
        this.Offset = 0;
        return;
        #endregion
        #endregion */

    }

    export class VScrollBarRange extends tsp.controls.Control {

        constructor(public VScrollBarSettings: IVScrollBarRangeSettings) {
            super(VScrollBarSettings);

            if (!VScrollBarSettings.generateRootElement) {
                VScrollBarSettings.generateRootElement = VScrollBarRange.generateElement;
            }
            
        }

        static generateElement(vsbr: VScrollBarRange): tsp.ElX {
            var browserInfo = tsp._.BrowserDetect;
            var browser = 'ie';
            var settings = vsbr.VScrollBarSettings;
            switch (browserInfo.browser) {
                case 'Explorer':
                    switch (browserInfo.version) {
                        case 10:
                            vsbr.BrowserSpecificMaxValueWithoutScaling = 900000;
                            vsbr.BrowserSpecificIncrement = 19;
                            vsbr.HeightMultiplicationFactor = settings.height / 7.91;
                            break;
                        default:
                            vsbr.BrowserSpecificMaxValueWithoutScaling = 25000;
                            vsbr.BrowserSpecificIncrement = 50;
                            vsbr.HeightMultiplicationFactor = settings.height / 22;
                    }
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


            var rootEl = Div({
                container:vsbr,
                kids: [
                    Div({
                        styles: { 'height': innerDivHeight + 'px' }
                    }),
                ],
                styles: {
                    'height': settings.height + 'px',
                    'overflow-y': 'scroll',
                    'width': '18px',
                },
            });

            if (settings.scrollValueSet) {
                tsp.addLocalEventListener({
                    elX: rootEl,
                    callback: VScrollBarScrollHandler,
                    topicName: 'scroll',
                });
            }
            return rootEl;
        }

        public HeightMultiplicationFactor: number;
        private BrowserSpecificMaxValueWithoutScaling: number;
        private IgnoreScrollEvent: number;
        public IsMaxedOut: bool;
        private BrowserSpecificIncrement: number;
        private Offset: number;
        private PreviousValue: number;
        private PreviousScrollTop: number;
        //public InnerDiv: DOM.ElX;

        

        
        
    }
}