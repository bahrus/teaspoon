var setContent = function (ID, html) {
    document.getElementById(ID).innerHTML = html;
};
function doPropTests() {
    var propTest1 = new PropTests.Test1();
    propTest1.Prop1 = "Prop Val 1";
    setContent('PropTests.Test1.Result', propTest1.Prop1);
    var propTest2 = new PropTests.Test2({
        Prop1: 'iah',
        Prop2: 'Prop Val 2'
    });
    setContent('PropTests.Test2.Result', propTest2.Prop2);
    var json = {
        Prop1: 'iah',
        Prop2: 'Prop Val 2'
    };
    var propTest3 = new PropTests.Test2(json);
    tsp._.ListenForSVChange({
        getter: propTest3.Prop2Getter,
        obj: propTest3,
        callback: function (newVal) {
            setContent('PropTests.Test3.Result', newVal);
        }
    });
    propTest3.Prop2 = 'new value';
}
function doElxTests() {
    var _ = tsp, Div = _.Div;
    var el1 = new _.ElX({
        tag: "div",
        textGet: function () {
            return "hello world";
        }
    });
    el1.render({
        targetDomID: 'Element.Test1.Result'
    });
    var el2 = _.Div({
        text: "I am here"
    });
    el2.render({
        targetDomID: 'Element.Test2.Result'
    });
    var el3 = Div({
        text: 'Parent Div',
        kids: [
            Div({
                text: 'child div'
            })
        ]
    });
    el3.render({
        targetDomID: 'Element.Test3.Result'
    });
}
function doInputTests() {
    var _ = tsp, Input = _.Input, Label = _.LabelForInput, Span = _.Span;
    var json = {
        Prop1: 'iah',
        Prop2: 'Prop Val 2'
    };
    var in1 = Input({
        value: "Default Text Value",
        type: 'text'
    });
    in1.render({
        targetDomID: 'Input.Test1.Result'
    });
    var propTest1 = new PropTests.Test2(json);
    var in2 = Input({
        valueGet: function () {
            return propTest1.Prop2;
        },
        type: 'text'
    });
    in2.render({
        targetDomID: 'Input.Test2.Result'
    });
    propTest1.Prop2 = 'new Val';
    var lbl2 = Label({
        text: 'label test',
        forElX: in2
    });
    lbl2.render({
        targetDomID: 'Input.Label2.Result'
    });
    var in3 = Input({
        type: 'checkbox'
    });
    var span3 = Span({
        kids: [
            Label({
                text: 'Label for Checkbox',
                forElX: in3
            }), 
            in3
        ]
    });
    span3.render({
        targetDomID: 'Input.Test3.Result'
    });
}
function doTwoWayBindingTests() {
    var _ = tsp, Div = _.Div, Input = _.Input, Label = _.LabelForInput, Span = _.Span;
    var json = {
        Prop1: 'iah',
        Prop2: 'Prop Val 2',
        BinaryProp1: true
    };
    var propTest1 = new PropTests.Test2(json);
    var d = Div({
        textGet: function () {
            return propTest1.Prop2;
        }
    });
    var tw1 = Div({
        kids: [
            d, 
            Input({
                valueGet: function (ie) {
                    return propTest1.Prop2;
                },
                type: 'text',
                valueSet: function (ie, newVal) {
                    propTest1.Prop2 = newVal;
                }
            }), 
            
        ]
    });
    _._.ListenForSVChange({
        getter: propTest1.Prop2Getter,
        obj: propTest1,
        callback: function (newVal) {
            d.notifyTextChange();
        }
    });
    tw1.render({
        targetDomID: 'TwoWayBinding.Test1.Result'
    });
    var d2 = Div({
        textGet: function () {
            return propTest1.BinaryProp1 ? 'yes' : 'no';
        }
    });
    var txt2 = Input({
        disabledGet: function (ie) {
            return propTest1.BinaryProp1;
        },
        value: 'testing'
    });
    var s2 = Span({
        text: 'i am here.',
        dynamicClasses: {
            'red': function (ie) {
                return propTest1.BinaryProp1;
            }
        }
    });
    var ckbox = Input({
        valueGet: function (ie) {
            return propTest1.BinaryProp1 ? 'checked' : null;
        },
        type: 'checkbox',
        valueSet: function (ie, newVal) {
            propTest1.BinaryProp1 = newVal ? true : false;
        }
    });
    var tw2 = Div({
        kids: [
            d2, 
            Label({
                forElX: ckbox,
                text: 'chkBox label'
            }), 
            ckbox, 
            txt2, 
            s2, 
            
        ]
    });
    _._.ListenForBVChange({
        getter: propTest1.BinaryProp1Getter,
        obj: propTest1,
        callback: function (newVal) {
            s2.notifyClassChange('red');
        }
    });
    _._.ListenForBVChange({
        getter: propTest1.BinaryProp1Getter,
        obj: propTest1,
        callback: function (newVal) {
            d2.notifyTextChange();
            txt2.notifyDisabledChange();
        }
    });
    tw2.render({
        targetDomID: 'TwoWayBinding.Test2.Result'
    });
}
if(tsp._.runtimeEnvironment.environment === tsp._.EnvironmentOptions.WebServer) {
    onWindowLoad();
} else {
    window.onload = function () {
        onWindowLoad();
    };
}
function doStaticLists() {
    var _ = tsp, UL = _.UL, LI = _.LI;
    var ul1 = UL({
        kids: [
            LI({
                text: 'list item 1',
                kids: [
                    UL({
                        collapsed: true,
                        toggleKidsOnParentClick: true,
                        kids: [
                            LI({
                                text: 'sub 1.1'
                            }), 
                            LI({
                                text: 'sub 1.2'
                            }), 
                            
                        ]
                    }), 
                    
                ]
            }), 
            LI({
                text: 'list item 2'
            }), 
            
        ]
    });
    ul1.render({
        targetDomID: 'Lists.Test1.Result'
    });
    var jsSubject = DataExamples.GenerateBooks(3, 3);
    var ul2 = UL({
        kids: [
            LI({
                text: jsSubject.subject,
                kids: [
                    UL({
                        toggleKidsOnParentClick: true,
                        collapsed: true,
                        kids: jsSubject.books.map(DataExamples.bookToLI)
                    })
                ]
            })
        ]
    });
    ul2.render({
        targetDomID: 'Lists.Test2.Result'
    });
}
function onWindowLoad() {
    doPropTests();
    doElxTests();
    doInputTests();
    doTwoWayBindingTests();
    doStaticLists();
}
//@ sourceMappingURL=app.js.map
