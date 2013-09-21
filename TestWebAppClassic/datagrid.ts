///<reference path='Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_script/tsp.ts'/>
///<reference path='tsp_script/tcp.ts'/>

$(function () {
    tcp._when('keyup', {
        selectorNodeTest: 'input.myTable_filter',
        handler: tcp.handleTextFilterChange,
    });

    
});

