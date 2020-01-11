var token = "";

files = []

currentMode = "list"
currentFolder = ""
currentName = ""

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

        for(i in result.files) {
            if(result.files[i].tag == "")
                result.files[i].tag = "*"
        }
        
        if(result.status == "error") {
            $("h1#username").html("error!!!");
            return;
        }

        files = result.files;
        currentName = result.name;
        dataReceived(result.name, files);
    }).fail(err => {
        console.error(err);
        window.location = "/";
    })
}

function setMode(mode) {
    currentMode = mode;
    dataReceived(currentName, files);
}

function enterFolder(folder) {
    currentFolder = folder;
    dataReceived(currentName, files);
    $("h3#folderName").text(folder);
}

function generateFoldersList(filesList, dom) {
    var folders = filesList.map(a => a.tag).filter((value, index, self) => {
        return self.indexOf(value) === index;
    })
    console.log(folders)
    var div = $('<div/>')
    .appendTo(dom)
    .addClass("folders")
    $.each(folders, i => {
        var folderLink = $('<a/>')
        .on("click", () => {
            enterFolder(folders[i]);
        })
        .attr("href", "#")
        .text(folders[i])
        .appendTo(div);
    })
}

function generateGallery(filesList, dom, folder) {
    $.each(filesList, i => {
        if(filesList[i].tag != folder && folder != "")
            return
        var div = $('<div/>')
        .addClass("gallery-entry")
        .appendTo(dom);
        var link = $('<a/>')
        .attr("href", `/api/getFile?token=${token}&id=${filesList[i].secuId}`)
        .appendTo(div);
        var img = $('<img/>')
        .attr("src", `/api/getImageThumbnail?token=${token}&id=${filesList[i].secuId}`)
        .appendTo(link)
        .on("error", (ev) => {
            ev.target.style.display = "none";
            var text = $('<span/>')
            .text(filesList[i].type.toUpperCase())
            .css("font-size", "30px")
            .css("text-align", "center")
            .prependTo(link);
        })

        var title = $('<span/>')
        .text(filesList[i].name)
        .appendTo(link)
        var date = $('<span/>')
        .text(filesList[i].uploaded ? new Date(filesList[i].uploaded).toLocaleString() : "No uploaded data")
        .appendTo(link);
    })
}

function generateFilesList(filesList, dom, folder) {
    var ul = $('<ul/>')
    .appendTo(dom);
    $.each(filesList, i => {
        if(filesList[i].tag != folder && folder != "")
            return
        var li = $('<li/>')
        .appendTo(ul);
        var getFileLink = $('<a/>')
        .attr("href", `/api/getFile?token=${token}&id=${filesList[i].secuId}`)
        .text(filesList[i].name + "." + filesList[i].type)
        .appendTo(li);
        var uploadedDate = $('<a/>')
        .text(filesList[i].uploaded ? new Date(filesList[i].uploaded).toLocaleString() : "No uploaded data")
        .on("click", (ev) => {
            ev.target.innerText = filesList[i].secuId;
        })
        .appendTo(li);
        var editLink = $('<a/>')
        .text("Edit")
        .attr("href", `/textedit?fid=${filesList[i].secuId}`)
        .appendTo(li);
        var deleteFileLink = $('<a/>')
        .on("click", e => {
            if(!confirm("Really delete file " + filesList[i].name + "?")) return;
            $.ajax({
                url: "/api/deleteFile",
                method: "get",
                data: {
                    token: token,
                    id: filesList[i].secuId
                },
                success: (data, status, xhr) => {
                    if(data.status == "error") {
                        alert("couldn't delete! " + data.error);
                    }else{
                        reloadList();
                    }
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

function dataReceived(name, files) {
    token = document.cookie.match(/token=([a-zA-Z0-9]+)/)[1];
    $("h1#username").html(name);

    var list = $("#files");
    list.empty();
    
    if(currentFolder == "") {
        generateFoldersList(files, list);
    }else if(currentMode == "gallery") {
        list.addClass("gallery");
        generateGallery(files, list, currentFolder);
    }else if(currentMode == "list"){
        generateFilesList(files, list, currentFolder);
    }
}

$(() => {
    reloadList();
    $("a#refresh").on("click", e => {
        reloadList();
    });
})