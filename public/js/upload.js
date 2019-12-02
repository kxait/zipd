$(() => {
    $('form').on('submit', e => {
        var self = $('form');
        var file = $("#file");
        e.preventDefault();
        $("span#message").html("sending file, do not close the page");
        var fd = new FormData();
        fd.append("file", file[0].files[0])
        fd.append("token", token);
        $.ajax({
            url: self[0].action,
            method: self[0].method,
            data: fd,
            processData: false,
            contentType: false,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        $("span#message").html("sending file, do not close page " + (Math.round(e.loaded / e.total)*100 + "% progress"));
                    }
                };
                return xhr;
            },
        }).then(result => {
            if(result.status == "success") {
                // you in!
                console.log(":)");
                $("span#message").html("success: " + result.message);
            }else{
                $("span#message").html(`${result.status}: ${result.error}`);
            }
        }).fail((xhr, status, error) => {
            $("span#error").html(`critical error: ${status}, ${error}`);
        })
    })
})