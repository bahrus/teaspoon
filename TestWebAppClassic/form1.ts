///<reference path='Scripts/typings/jquery/jquery.d.ts'/>
///<reference path='tsp_script/tcp.ts'/>

tcp._when('change', {
    selectorText: 'input',
    handler: evt => {
        debugger;
        var url = $('form[name="myForm"]').serialize();
        $('#tcp_urlBuilder').val(url);
    },
});
