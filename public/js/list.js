function dataReceived(name, files) {
    var token = document.cookie.match(/token=([a-zA-Z0-9]+)/)[1];
    $("h1#username").html("hi " + name);
;
    var list = $("ul#files");
    $.each(files, i => {
        var li = $('<li/>')
            .appendTo(list);
        var aaa = $('<a/>')
            .attr("href", `/api/getFile?token=${token}&id=${files[i]._id}`)
            .text(files[i].name + "." + files[i].type)
            .appendTo(li);
    });
}

$(() => {
    var token = getToken();
    if(token == null) {
        window.location = "/";
        return;
    }
    $.ajax({
        url: "/api/getUserFiles",
        method: "get",
        data: {
            token: token
        }
    }).done(result => {
        console.log(result);
        if(result.status == "error") {
            $("h1#username").html("error!!!");
            return;
        }
        dataReceived(result.name, result.files);
    }).fail(err => {
        console.error(err);
        window.location = "/";
    })

    $("a#logout").on("click", e => {
        logout();
    })
})