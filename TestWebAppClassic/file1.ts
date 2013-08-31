///<reference path='jquery.d.ts'/>
///<reference path='tsp_script/tsp.ts'/>
///<reference path='ITestWebAppClassic.d.ts'/>

declare var model: TestWebAppClassic.IProduct;

tsp._if('.content2',
    tsp.createConditionalRule({
        condition: (el?: HTMLElement) => model.Price > 3,
        actionIfTrue: (el?: HTMLElement) => { el.parentNode.removeChild(el); },
    }).mergedObject
);




