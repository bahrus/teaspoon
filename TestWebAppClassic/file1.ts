///<reference path='jquery.d.ts'/>
///<reference path='tsp.ts'/>


//<style>
//        .content1 {
//            tsp-ssx: 'tsp.applyConditionalRule';
//            tsp-condition : 'model.Name !== "Harry Potter"';
//            tsp-actionIfTrue : 'function(el){el.parentNode.removeChild(el);}';
//}
        
//    < / style >
var mode = "server";
$(function () {
    //tsp.push({
    //    selectorText: '.content1',
    //    properties: {
    //        'tsp-condition': 'model.Name !== "Harry Potter"',
    //        'tsp-actionIfTrue': 'function(el){el.parentNode.removeChild(el);}',
    //    },
    //});
    tsp.applyRules(document);
});