$(() => {
    var token = getToken();
    if(token == null) {
        window.location = "/";
        return;
    }

    $('form').on('submit', e => {
        var self = $('form');
        var file = $("#file");
        e.preventDefault();
        $("span#message").html("");
        var fd = new FormData();
        fd.append("file", file[0].files[0])
        fd.append("token", token);
        $.ajax({
            url: self[0].action,
            method: self[0].method,
            data: fd,
            processData: false,
            contentType: false,
            cache: false
        }).then(result => {
            if(result.status == "success") {
                // you in!
                console.log(":)");
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