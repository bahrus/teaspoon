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
if(tsp._.runtimeEnvironment.environment === tsp._.EnvironmentOptions.WebServer) {
    onWindowLoad();
} else {
    window.onload = function () {
        onWindowLoad();
    };
}
function onWindowLoad() {
    doPropTests();
    doElxTests();
    doInputTests();
}
//@ sourceMappingURL=app.js.map
