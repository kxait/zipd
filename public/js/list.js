function reloadList() {
    var list = $("ul#files");
    list.empty();
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
    $.each(files, i => {
        var li = $('<li/>')
            .appendTo(list);
        var getFileLink = $('<a/>')
            .attr("href", `/api/getFile?token=${token}&id=${files[i]._id}`)
            .text(files[i].name + "." + files[i].type)
            .appendTo(li);
        var uploadedDate = $('<a/>')
            .text(files[i].uploaded ? new Date(files[i].uploaded).toLocaleString() : "No uploaded data")
            .appendTo(li);
        if(files[i].tag != "") {
            var tag = $('<a/>')
                .text(files[i].tag)
                .addClass("tag")
                .appendTo(li);
        }
        var deleteFileLink = $('<a/>')
            .on("click", e => {
                if(!confirm("Really delete file " + files[i].name + "?")) return;
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