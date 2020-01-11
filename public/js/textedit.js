var file = ""

changeSize = (area, fun) => () => {
    var size = area.css("font-size").match(/[0-9]+/)[0];
    size = Number(size);
    area.css("font-size", (fun(size)).toString() + "px")
}

deleteFile = (secuId) => new Promise((res, reject) => {
    $.ajax({
        method: "get",
        url: `/api/deleteFile?token=${token}&id=${secuId}`
    }).done(data => {
        console.log(data);
        if(data.status == "error") {
            reject(data.error);
        }else{
            res(data);
        }
    }).fail(err => {
        reject(err);
    });
})

saveAndDeleteFileFromTextarea = (area) => () => {
    saveFileFromTextarea(area, file.name + "." + file.type, file.tag)
        .then(idToDelete => {
            deleteFile(idToDelete).catch(err => {
                alert("couldn't delete old file: " + err);
            });
        })
}

setFileNameHeader = (fname) => {
    document.getElementById("fname").innerText = fname;
}

saveFileFromTextarea = (area, fname, tag) => new Promise((resolve, reject) => {
    var fd = new FormData();
    var content = area.val();
    var filePayload = new File([content], fname);
    fd.append("files[]", filePayload);
    fd.append("tag", tag);
    fd.append("token", token);

    $.ajax({
        method: "post",
        url: "/api/uploadSingleFile",
        data: fd,
        processData: false,
        contentType: false
    }).done(data => {
        console.log(data);
        if(data.status == "error") {
            $("span#message").text("fail: " + data.error);
            reject(data.error);
        }else{
            var obj = data.file
            var idToDelete = file.secuId;
            file = obj
            $("span#message").text("done: " + obj.secuId);
            setFileNameHeader(obj.name + "." + obj.type);
            resolve(idToDelete);
        }
    }).fail(err => {
        $("span#message").text("fatal fail: " + err)
        reject(err);
    })
});

saveAsFileFromTextarea = (area) => () => { 
    var fname = prompt("File name?");
    var tag = prompt("Tag? (Folder to put into?)");
    saveFileFromTextarea(area, fname, tag);
}

$(() => {
    var fid = new URLSearchParams(window.location.search).get("fid");
    if(fid == null || fid == "") {
        alert("No file selected!");
        window.location = "/list";
    }

    var area = $("textarea");

    $.ajax({
        url: `/api/getUserFiles?token=${token}`,
        method: "get"
    }).done(data => {
        var filtered = data.files.filter(f => f.secuId == fid);
        if(filtered.length != 1) {
            alert("File list error: returned length is not 1. Contact a developer");
        }
        file = filtered[0];
        setFileNameHeader(file.name + "." + file.type);

        $("a#save").on("click", saveAndDeleteFileFromTextarea(area));
        $("a#save-as").on("click", saveAsFileFromTextarea(area))
    }).fail(err => {
        alert("Error getting user files: " + err);
        window.location = "/"
    })

    $.ajax({
        url: `/api/getFile?token=${token}&id=${fid}`,
        method: "get"
    }).done(data => {
        area.val(data);
    }).fail(err => {
        alert("File error:" + err);
        window.location = "/";
    })

    $("a#font-smaller").on("click", changeSize(area, a => a-2));
    $("a#font-bigger").on("click", changeSize(area, a => a+2));
    $("a#cancel").on("click", () => { window.location = "/"; });
})