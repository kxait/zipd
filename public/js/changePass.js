$(() => {
    var token = getToken();
    if(token == null) {
        window.location = "/";
        return;
    }

    $('form').on('submit', e => {
        e.preventDefault();
        $("span#message").html("changing password...");

        var oldPass = $('input#old').val();
        var newPass = $('input#new').val();
        var newConfirm = $('input#newConfirm').val();

        if(newPass != newConfirm) {
            $("span#message").html("new passwords aren't the same");
            return;
        }

        var self = $('form');
        var formdata = self.serialize();
        formdata += "&token=" + token;
        $.ajax({
            url: self[0].action,
            method: self[0].method,
            data: {
                old: md5(oldPass),
                new: md5(newPass),
                token: token
            },
        }).then(result => {
            if(result.status == "success") {
                $("span#message").html("success");
            }else{
                $("span#message").html(`${result.status}: ${result.error}`);
            }
        }).fail((xhr, status, error) => {
            $("span#error").html(`critical error: ${status}, ${error}`);
        })
    })

    $("a#logout").on("click", e => {
        logout();
    })
})