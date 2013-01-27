///<reference path="../ElX.ts" />
///<reference path="control.ts" />

module tsp.controls {
    export interface IHScrollBarRangeSettings extends tsp.controls.IControlSettings {
        maxValue: number;
        maxValueGetter? (): number;
        maxRemainder?: number;
        width: number;
        scrollValueGet? (v: HScrollBarRange): number;
        scrollValueSet? (v: HScrollBarRange, val: number): number;
    }

    function HScrollBarScrollHandler(tEvent: ITopicEvent) {
        var outerDivElX = tEvent.elX;
        var hsbr = <HScrollBarRange> outerDivElX.bindInfo.container;
        var scrollLeft: number = outerDivElX.el.scrollLeft;
        if (!hsbr.IsMaxedOut) {
            var scrollValue = Math.floor(scrollLeft / hsbr.WidthMultiplicationFactor);
            hsbr.HScrollBarSettings.scrollValueSet(hsbr, scrollValue);
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

    export class HScrollBarRange extends tsp.controls.Control {

        constructor(public HScrollBarSettings: IHScrollBarRangeSettings) {
            super(HScrollBarSettings);

            if (!HScrollBarSettings.generateRootElement) {
                HScrollBarSettings.generateRootElement = HScrollBarRange.generateElement;
            }

        }

        static generateElement(hsbr: HScrollBarRange): tsp.ElX {
            var browserInfo = tsp._.BrowserDetect;
            var browser = 'ie';
            var settings = hsbr.HScrollBarSettings;
            switch (browserInfo.browser) {
                case 'Chrome':
                    switch (browserInfo.version) {
                        case 26:
                            hsbr.BrowserSpecificMaxValueWithoutScaling = 900000;
                            hsbr.BrowserSpecificIncrement = 19;
                            hsbr.WidthMultiplicationFactor = settings.width / 4;
                            break;
                    }
                    break;
                case 'Explorer':
                    switch (browserInfo.version) {
                        case 10:
                            hsbr.BrowserSpecificMaxValueWithoutScaling = 900000;
                            hsbr.BrowserSpecificIncrement = 19;
                            hsbr.WidthMultiplicationFactor = settings.width / 7.91;
                            break;
                        default:
                            hsbr.BrowserSpecificMaxValueWithoutScaling = 25000;
                            hsbr.BrowserSpecificIncrement = 50;
                            hsbr.WidthMultiplicationFactor = settings.width / 22;
                    }
                    break;
                case 'firefox':
                    hsbr.BrowserSpecificMaxValueWithoutScaling = 900000;
                    hsbr.BrowserSpecificIncrement = 19;
                    hsbr.WidthMultiplicationFactor = settings.width / 8.1;
                    break;
                default:

                }
            var numberOfRecordsToLeaveForLastPage = 0;
            if (settings.maxRemainder != null) {
                numberOfRecordsToLeaveForLastPage = settings.maxRemainder;
            }
            //var innerDivHeight = (int)(((int)this.MaxValue - numberOfRecordsToLeaveForLastPage) * this.HeightMultiplicationFactor + this.Dimensions.Height);
            var innerDivWidth = Math.floor((settings.maxValue - numberOfRecordsToLeaveForLastPage) * hsbr.WidthMultiplicationFactor + settings.width);
            if (settings.maxValue > hsbr.BrowserSpecificMaxValueWithoutScaling) {
                hsbr.IsMaxedOut = true;
                innerDivWidth = Math.min(innerDivWidth, hsbr.BrowserSpecificMaxValueWithoutScaling);

            }
            var _ = tsp, Div = _.Div;


            var rootEl = Div({
                container: hsbr,
                kids: [
                    Div({
                        styles: { 'width': innerDivWidth + 'px' },
                        text: '&nbsp;',
                    }),
                ],
                styles: {
                    'width': settings.width + 'px',
                    'overflow-x': 'scroll',
                    'height': '18px',
                },
            });

            if (settings.scrollValueSet) {
                tsp.addLocalEventListener({
                    elX: rootEl,
                    callback: HScrollBarScrollHandler,
                    topicName: 'scroll',
                });
            }
            return rootEl;
        }

        public WidthMultiplicationFactor: number;
        private BrowserSpecificMaxValueWithoutScaling: number;
        private IgnoreScrollEvent: number;
        public IsMaxedOut: bool;
        private BrowserSpecificIncrement: number;
        private Offset: number;
        private PreviousValue: number;
        private PreviousScrollLeft: number;
        //public InnerDiv: DOM.ElX;


    }
}