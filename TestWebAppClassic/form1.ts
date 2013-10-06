///<reference path='Scripts/typings/jquery/jquery.d.ts'/>

module form1 {
    export function changeHandler(evt: Event) {
        var url = $('form[name="myForm"]').serialize();
        $('#tcp_urlBuilder').val(url);
    }
}

