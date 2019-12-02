function reloadList() {
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
}

function dataReceived(name, files) {
    var token = document.cookie.match(/token=([a-zA-Z0-9]+)/)[1];
    $("h1#username").html(name);

    var list = $("ul#files");
    list.empty();
    $.each(files, i => {
        var li = $('<li/>')
            .appendTo(list);
        var getFileLink = $('<a/>')
            .attr("href", `/api/getFile?token=${token}&id=${files[i]._id}`)
            .text(files[i].name + "." + files[i].type)
            .appendTo(li);
        var deleteFileLink = $('<a/>')
            .on("click", e => {
                var self = e.target;
                deleteFileLink.remove();
                var newDelete = $("<a/>")
                    .on("click", e => {
                        $.ajax({
                            url: "/api/deleteFile",
                            method: "get",
                            data: {
                                token: token,
                                id: files[i]._id
                            },
                            success: (data, status, xhr) => {
                                reloadList();
                            },
                            error: (xhr, status, error) => {
                                console.log(this);
                                alert("couldn't delete!");
                            }
                        })
                    })
                    .text("Are you sure?")
                    .attr("href", "#")
                    .appendTo(li);
            })
            .text("Delete")
            .attr("href", "#")
            .appendTo(li);
    });
}

$(() => {
    reloadList();
    $("a#refresh").on("click", e => {
        reloadList();
    });
})