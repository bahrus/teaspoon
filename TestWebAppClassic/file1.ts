///<reference path='Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_script/tsp.ts'/>
///<reference path='ITestWebAppClassic.d.ts'/>

declare var model: any;

var product = <TestWebAppClassic.IProduct> model.product;
tsp._if('.content2',
    tsp.createConditionalRule({
        condition: (el?: HTMLElement) => product.Price > 3,
        actionIfTrue: (el?: HTMLElement) => { el.parentNode.removeChild(el); },
    }).mergedObject
);




