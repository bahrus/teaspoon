///<reference path='Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_script/tcp.ts'/>

tsp._if('input[form]', 
    tcp.createBindingRule({
        form: 'myForm',
        ignoreIfFormAttrSupport: true,
        propertyToMonitor: 'value',
    }).mergedObject
);


tcp._when('change', {
    selectorText: 'input',
    handler: evt => {
        
        var url = $('form[name="myForm"]').serialize();
        $('#tcp_urlBuilder').val(url);
    },
});
