$(() => {
    $("#file").change(() => {
        $("span#message").html("Ready to send");
    })
    $('form').on('submit', e => {
        var self = $('form');
        var file = $("#file");
        var fileTag = $("#name").val();
        e.preventDefault();
        $("span#message").html("Sending file, do not close this page.");

        var fd = new FormData();
        var fileData = file[0].files;
        fd.append("tag", fileTag);
        for(i in fileData) {
            fd.append("files[]", fileData[i])
        }
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
                        $("span#message").html("File sending in progress, do not close this page. <br>Progress: " + (Math.round(e.loaded / e.total * 100) + "%"));
                    }
                };
                return xhr;
            },
        }).then(result => {
            if(result.status == "success") {
                // you in!
                console.log(":)");
                $("span#message").html("File sent successfully: " + result.message);
            }else{
                $("span#message").html(`${result.status}: ${result.error}`);
            }
        }).fail((xhr, status, error) => {
            $("span#error").html(`critical error: ${status}, ${error}`);
        })
    })
})