$(() => {
    $('form#login').on('submit', e => {
        var self = $('form#login');
        e.preventDefault();
        $("span#error").html("");
        var pass = $('input#pass').val();
        var user = $('input#name').val()
        var form_data = self.serialize();
        $.ajax({
            url: self[0].action,
            method: self[0].method,
            data: {
                username: user,
                password: md5(pass)
            }
        }).then(result => {
            if(result.status == "success") {
                // you in!
                console.log(":)");
                var cookieExpiry = new Date(result.expires).toGMTString();
                document.cookie = `token=${result.token};expires=${cookieExpiry};path=/`
                window.location = "/list";
            }else{
                $("span#error").html(`${result.status}: ${result.error}`);
            }
        }).fail((xhr, status, error) => {
            $("span#error").html(`critical error: ${status}, ${error}`);
        })
    })
    if(getToken() != null) {
        window.location = "/list";
        return;
    }
})