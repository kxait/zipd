var token = "";

files = []

currentMode = ""
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

    $("a#gallery").addClass(mode == "gallery" ? "uname" : "")
    $("a#gallery").removeClass(mode == "list" ? "uname" : "")
    $("a#list").addClass(mode == "list" ? "uname" : "")
    $("a#list").removeClass(mode == "gallery" ? "uname" : "")
}

function enterFolder(folder) {
    currentFolder = folder;
    $("a#new").css("display", (folder == "" ? "none" : "inline"));
    dataReceived(currentName, files);
    $("h1#folderName").text(folder == "" ? "folders" : folder);
}

function createNewFile() {
    var fname = prompt("File name?");
    var tag = currentFolder;
    var fd = new FormData();
    var file = new File([""], fname);
    fd.append("files[]", file);
    fd.append("token", token);
    fd.append("tag", tag);
    $.ajax({
        method: "post",
        url: "/api/uploadSingleFile",
        data: fd,
        processData: false,
        contentType: false
    }).then(data => {
        if(data.status == "error") {
            alert(data.error);
        }else{
            reloadList();
        }
    }).fail(err => {
        alert(err);
    })
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
        var folderLink = $('<div/>')
        .on("click", () => {
            enterFolder(folders[i]);
        })
        .addClass("folder")
        .appendTo(div);

        var folderNo = $('<span/>')
        .text(folders[i])
        .addClass("folder")
        .addClass("folder-name")
        .appendTo(folderLink);

        var elemsNo = $('<span/>')
        .text(filesList.filter(a => a.tag == folders[i]).length + " files")
        .addClass("folder")
        .addClass("elems-no")
        .appendTo(folderLink);
    })
}

function generateGallery(filesList, dom, folder) {
    var labelToggle = $("<a/>")
    .appendTo(dom)
    .text("Toggle labels")
    .on("click", e => {
        self = e.target;
        displ = $("span.gallery-label").css("display");
        $("span.gallery-label").css("display", displ == "none" ? "block" : "none");
    })
    var galleryContainer = $("<div/>")
    .appendTo(dom)
    .attr("id", "gallery-container");
    $.each(filesList, i => {
        if(filesList[i].tag != folder && folder != "")
            return
        var div = $('<div/>')
        .addClass("gallery-entry")
        .appendTo(galleryContainer);
        var link = $('<a/>')
        .attr("href", `/api/getFile?token=${token}&id=${filesList[i].secuId}`)
        .appendTo(div);
        var img = $('<img/>')
        .attr("src", `/api/getSimpleThumbnail?token=${token}&id=${filesList[i].secuId}`)
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
        .addClass("gallery-label")
        .appendTo(link)
        var date = $('<span/>')
        .text(filesList[i].uploaded ? new Date(filesList[i].uploaded).toLocaleString() : "No uploaded data")
        .addClass("gallery-label")
        .appendTo(link);
    })
}

function generateFilesTableHeader(){
    var tr = $('<tr/>');
    var thName = $('<th/>')
    .text("Name")
    .appendTo(tr);
    var thDate = $('<th/>')
    .text("Date")
    .appendTo(tr);
    return tr;
}

function generateFilesList(filesList, dom, folder) {
    var ul = $('<table/>')
    .appendTo(dom);

    generateFilesTableHeader().appendTo(ul);

    $.each(filesList, i => {
        if(filesList[i].tag != folder && folder != "")
            return
        var li = $('<tr/>')
        .appendTo(ul);
        var getFileEntry = $('<td/>')
        .appendTo(li);
        var getFileLink = $('<a/>')
        .attr("href", `/api/getFile?token=${token}&id=${filesList[i].secuId}`)
        .text(filesList[i].name + "." + filesList[i].type)
        .appendTo(getFileEntry);
        var uploadedDate = $('<td/>')
        .text(filesList[i].uploaded ? new Date(filesList[i].uploaded).toLocaleString() : "No uploaded data")
        .on("click", (ev) => {
            ev.target.innerText = filesList[i].secuId;
        })
        .appendTo(li);
        var editEntry = $('<td/>')
        .appendTo(li);
        var editLink = $('<a/>')
        .text("Edit")
        .attr("href", `/textedit?fid=${filesList[i].secuId}`)
        .appendTo(editEntry);
        var deleteFileEntry = $('<td/>')
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
        .appendTo(deleteFileEntry);
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
    setMode("list");
    reloadList();
    $("a#refresh").on("click", e => {
        reloadList();
    });
})