///<reference path="ts/lib/_.ts" />
///<reference path="ts/lib/ElX.ts" />
///<reference path="ts/lib/InputElement.ts" />
///<reference path="ts/lib/InputElement.ts" />
///<reference path="PropTests.ts" />
///<reference path="Books.ts" />
///<reference path="ts/lib/controls/control.ts" />
///<reference path="ts/lib/controls/VScrollBar.ts" />
///<reference path="ts/lib/controls/HScrollBar.ts" />

var setContent = (ID: string, html: string) => {
    document.getElementById(ID).innerHTML = html;
};
var i = 5 ;   

function doPropTests() {
    var propTest1 = new PropTests.Test1();
    propTest1.Prop1 = "Prop Val 1";
    setContent('PropTests.Test1.Result', propTest1.Prop1);
    var propTest2 = new PropTests.Test2({
        Prop1: 'iah',
        Prop2: 'Prop Val 2',
    });
    setContent('PropTests.Test2.Result', propTest2.Prop2);

    var json = {
        Prop1: 'iah',
        Prop2: 'Prop Val 2',
    };

    var propTest3 = new PropTests.Test2(json);


    tsp._.ListenForSVChange({
        getter: propTest3.Prop2Getter,
        obj: propTest3,
        callback: newVal => {
            setContent('PropTests.Test3.Result', newVal);
        },
    });

    propTest3.Prop2 = 'new value';
    console.log(propTest3);

}

function doElxTests() {
    var _ = tsp, Div = _.ElX.Div;

    var el1 = new _.ElX({
        tag: "div",
        textGet: () => "hello world",
    });
    el1.render({ targetDomID: 'Element.Test1.Result' });

    var el2 = _.ElX.Div({ text: "I am here" });
    el2.render({ targetDomID: 'Element.Test2.Result' });

    var el3 =
    Div({
        text: 'Parent Div', kids:
            [Div({ text: 'child div' })]
    });

    el3.render({ targetDomID: 'Element.Test3.Result' });
}

function doInputTests() {
    var _ = tsp, Input = _.Input, Label = _.LabelForInput, Span = _.ElX.Span;
    var json = {
        Prop1: 'iah',
        Prop2: 'Prop Val 2',
    };
    //#region Test 1
    var in1 = Input({ value: "Default Text Value", type: 'text' });

    in1.render({ targetDomID: 'Input.Test1.Result' });
    //#endregion

    var propTest1 = new PropTests.Test2(json);

    var in2 = Input({ valueGet: () => propTest1.Prop2, type: 'text' });

    in2.render({ targetDomID: 'Input.Test2.Result' });

    propTest1.Prop2 = 'new Val';

    var lbl2 = Label({ text: 'label test', forElX: in2 });

    lbl2.render({ targetDomID: 'Input.Label2.Result' });

    var in3 = Input({ type: 'checkbox' });
    var span3 = Span({
        kids: [Label({ text: 'Label for Checkbox', forElX: in3 }), in3],
    });
    span3.render({ targetDomID: 'Input.Test3.Result' });
    //var in3 = Input({

}

function doTwoWayBindingTests() {
    var _ = tsp, Div = _.ElX.Div, Input = _.Input, Label = _.LabelForInput, Span = _.ElX.Span;
    var json = {
        Prop1: 'iah',
        Prop2: 'Prop Val 2',
        BinaryProp1: true,
    };
    var propTest1 = new PropTests.Test2(json);
    var d = Div({ textGet: () => propTest1.Prop2 });
    //var n = d.notifyTextChange;
    var tw1 = Div({
        kids: [
            d,
            Input({ valueGet: (ie) => propTest1.Prop2, type: 'text', valueSet: (ie, newVal) => { propTest1.Prop2 = newVal; } }),
        ]
    });
    _._.ListenForSVChange({
        getter: propTest1.Prop2Getter,
        obj: propTest1,
        callback: newVal => {
            d.notifyTextChange();
        },
    });
    tw1.render({ targetDomID: 'TwoWayBinding.Test1.Result' });

    var d2 = Div({
        textGet: () => propTest1.BinaryProp1 ? 'yes' : 'no',
    });
    var txt2 = Input({ disabledGet: (ie) => propTest1.BinaryProp1, value: 'testing' });
    var s2 = Span({
        text: 'i am here.',
        dynamicClasses: {
            'red': (ie) => propTest1.BinaryProp1,
        }
    });
    //s2.bindInfo.dynamicClasses['red'] = (ie) => propTest1.BinaryProp1;
    var ckbox = Input({ valueGet: (ie) => propTest1.BinaryProp1 ? 'checked' : null, type: 'checkbox', valueSet: (ie, newVal) => { propTest1.BinaryProp1 = newVal ? true : false; } });
    var tw2 = Div({
        kids: [
            d2,
            Label({ forElX: ckbox, text: 'chkBox label' }),
            ckbox,
            txt2,
            s2,
        ],
    });
    _._.ListenForBVChange({
        getter: propTest1.BinaryProp1Getter,
        obj: propTest1,
        callback: newVal => {
            //d2.notifyTextChange();
            //txt2.notifyDisabledChange();
            s2.notifyClassChange('red');
        },
    });
    _._.ListenForBVChange({
        getter: propTest1.BinaryProp1Getter,
        obj: propTest1,
        callback: newVal => {
            d2.notifyTextChange();
            txt2.notifyDisabledChange();
            //s2.notifyClassChange('red');
        },
    });
    tw2.render({ targetDomID: 'TwoWayBinding.Test2.Result' });
}

if (tsp._.Environment.runtimeEnvironment.environment === tsp._.EnvironmentOptions.WebServer) {
    onWindowLoad();
} else {
    window.onload = () => {
        onWindowLoad();
    };
}

function doStaticLists() {
    var _ = tsp, UL = _.ElX.UL, LI = _.ElX.LI;
    var ul1 = UL({
        kids: [
            LI({
                text: 'list item 1', kids: [
                    UL({
                        collapsed: true, toggleKidsOnParentClick: true, kids: [
                        LI({ text: 'sub 1.1' }),
                        LI({ text: 'sub 1.2' }),
                        ],
                    }),
                ],
            }),
            LI({ text: 'list item 2' }),
        ],
    });
    console.log('iah1');
    ul1.render({ targetDomID: 'Lists.Test1.Result' });
    console.log('iah2');

    var jsSubject = DataExamples.GenerateBooks(3, 3);
    var ul2 = UL({
        kids:
        [LI({
            text: jsSubject.subject,
            kids: [UL({
                toggleKidsOnParentClick: true,
                collapsed: true,
                kids: jsSubject.books.map(DataExamples.bookToLI),
            })],
        })],
    });
    ul2.render({ targetDomID: 'Lists.Test2.Result' });

    console.log('iah3');
}

var doDynamicLists_json: DataExamples.ISubject;
function doDynamicLists() {
    var _ = tsp, UL = _.ElX.UL, LI = _.ElX.LI;

    var jsSubject = DataExamples.GenerateBooks(10, 10);
    doDynamicLists_json = jsSubject;


    var ul1 = UL({
        kids:
            [LI({
                text: jsSubject.subject,
                kids: [UL({
                    dataContext: jsSubject,
                    toggleKidsOnParentClick: true,
                    collapsed: true,
                    kidsGet: DataExamples.bookGen,
                })],

            })]

    });
    tsp.SelectFns.addSelectionChangeListener('global', selectionChangeListener);

    ul1.render({ targetDomID: 'DynamicLists.Test1.Result' });
}

function selectionChangeListener() {
    var _ = tsp, UL = _.ElX.UL;
    var selectedChapters: DataExamples.IChapter[] = [];
    doDynamicLists_json.books.forEach(book => {
        book.chapters.forEach(chapter => {
            if (chapter.selected) {
                selectedChapters.push(chapter);
            }
        });
    });

    var ul2 = UL({
        kids: selectedChapters.map(ch => DataExamples.chapterToLI2(ch, 0)),
    });
    ul2.render({ targetDomID: 'DynamicLists.Test1.Result.Detail' });
    //console.log(ul2);
}

function doCustomInputTests() {
    var _ = tsp, Span = _.ElX.Span, Div = _.ElX.Div;
    var json = new PropTests.Test2({
        BinaryProp1: true,
        NumberProp1: 0,
        NumberProp2: 0,
        Prop2: 'hello',
    });
    console.log("doCustomInputTests.1");
    var vscroll1 = new tsp.controls.VScrollBarRange({
        maxValue: 20000,
        height: 150,
        scrollValueSet: (ie, newVal) => {
            json.NumberProp1 = newVal;
        },
    });
    console.log("doCustomInputTests.2");
    var span1 = Span({
        textGet: () => 'v:' + json.NumberProp1,
    });
    var d = Div({
        kids: [span1, vscroll1],
    });
    console.log("doCustomInputTests.3");
    _._.ListenForNVChange({
        getter: json.NumberProp1Getter,
        obj: json,
        callback: newVal => {
            span1.notifyTextChange();
            //s2.notifyClassChange('red');
        },
    });
    console.log("doCustomInputTests.4");
    d.render({
        targetDomID: 'VScrollbar.Test1.Result',
    });

    var hscroll1 = new tsp.controls.HScrollBarRange({
        maxValue: 10000,
        width: 200,
        scrollValueSet: (ie, newVal) => {
            json.NumberProp2 = newVal;
        },
    });
    var span2 = Span({
        textGet: () => 'h:' + json.NumberProp2,
    });
    var d2 = Div({
        kids: [span2, hscroll1],
    });
    _._.ListenForNVChange({
        getter: json.NumberProp2Getter,
        obj: json,
        callback: newVal => {
            span2.notifyTextChange();
        }
    });
    d2.render({
        targetDomID: 'HScrollbar.Test1.Result',
    });
}

function onWindowLoad() {
    doPropTests();
    doElxTests();
    doInputTests();
    doTwoWayBindingTests();
    doStaticLists();
    doDynamicLists();   
    doCustomInputTests();
}